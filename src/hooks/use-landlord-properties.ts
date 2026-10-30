"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { refreshPublicListings } from "@/app/actions/properties";
import { getErrorMessage, isApiError } from "@/lib/api/client";
import { landlordService } from "@/lib/api/landlord";
import { propertiesService } from "@/lib/api/properties";
import { queryKeys } from "@/lib/query-keys";
import type {
  AvailabilityStatus,
  Paginated,
  PropertyInput,
  PropertyQuery,
  PropertyUpdateInput,
  PropertyWithRelations,
} from "@/types";

export const LANDLORD_PROPERTIES_PATH = "/dashboard/landlord/properties";
const PAGE_SIZE = 10;

/** After any write: refetch dashboard lists and refresh the public pages. */
function afterPropertyChange(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.landlord.properties.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
  void refreshPublicListings();
}

export type LandlordPropertyFilters = Pick<PropertyQuery, "availabilityStatus" | "propertyType">;

export function useLandlordProperties(page: number, filters: LandlordPropertyFilters = {}) {
  return useQuery({
    queryKey: queryKeys.landlord.properties.list({ page, ...filters }),
    queryFn: () =>
      landlordService.getProperties({ page, limit: PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc", ...filters }),
    placeholderData: keepPreviousData,
  });
}

/** Up to 100 of the landlord's properties, for overview counts. */
export function useAllLandlordProperties() {
  return useQuery({
    queryKey: queryKeys.landlord.properties.list({ limit: 100 }),
    queryFn: () => landlordService.getProperties({ limit: 100 }),
  });
}

/** One property (public endpoint; the edit page checks ownership). */
export function useProperty(id: string) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id),
    queryFn: () => propertiesService.getById(id),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PropertyInput) => landlordService.createProperty(input),
    onSuccess: (property) => {
      afterPropertyChange(queryClient);
      toast.success(`“${property.title}” is now listed`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PropertyUpdateInput }) =>
      landlordService.updateProperty(id, input),
    onSuccess: (property) => {
      afterPropertyChange(queryClient);
      toast.success(`Saved changes to “${property.title}”`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

type ListSnapshot = [readonly unknown[], Paginated<PropertyWithRelations> | undefined][];

/** Flips AVAILABLE ⇄ RENTED instantly; rolls back if the API refuses. */
export function useToggleAvailability() {
  const queryClient = useQueryClient();
  const listKey = queryKeys.landlord.properties.all;

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AvailabilityStatus }) =>
      landlordService.updateProperty(id, { availabilityStatus: status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const snapshot: ListSnapshot = queryClient.getQueriesData({ queryKey: listKey });
      queryClient.setQueriesData<Paginated<PropertyWithRelations>>({ queryKey: listKey }, (old) =>
        old && {
          ...old,
          data: old.data.map((item) => (item.id === id ? { ...item, availabilityStatus: status } : item)),
        },
      );
      return { snapshot };
    },
    onError: (error, _variables, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(getErrorMessage(error));
    },
    onSuccess: (property) => {
      toast.success(
        property.availabilityStatus === "AVAILABLE"
          ? `“${property.title}” is available again`
          : `“${property.title}” marked as rented`,
      );
    },
    onSettled: () => afterPropertyChange(queryClient),
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => landlordService.deleteProperty(id),
    onSuccess: () => {
      afterPropertyChange(queryClient);
      toast.success("Property deleted");
    },
    onError: (error) =>
      // 409: the property has rental requests (foreign key), so it can't be removed.
      toast.error(
        isApiError(error) && error.status === 409
          ? "This property has rental requests, so it can't be deleted. Mark it as rented instead."
          : getErrorMessage(error),
      ),
  });
}
