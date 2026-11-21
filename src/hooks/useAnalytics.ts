import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiRequest, buildQueryString } from "@/lib/api";
import type { AnalyticsOverview, ApiResponse } from "@/types";

export interface AnalyticsQueryParams {
  range?: "7d" | "30d" | "90d" | "all";
  from?: string;
  to?: string;
}

export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: (params: AnalyticsQueryParams) =>
    [...analyticsKeys.all, "overview", params] as const,
};

export function useAnalyticsOverview(params: AnalyticsQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.overview(params),
    queryFn: async () => {
      const res = await apiRequest<ApiResponse<AnalyticsOverview>>(
        `/analytics/overview${buildQueryString(
          params as Record<string, string | undefined>
        )}`
      );
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}
