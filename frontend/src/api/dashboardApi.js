import { apiSlice } from "./apiSlice";

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    getDashboard: builder.query({
      query: (role) => ({
        url: `/dashboard/${role}`,   // ✅ MOST IMPORTANT FIX
        method: "GET",
      }),
      providesTags: ["Report"],
    }),

  }),
});

export const { useGetDashboardQuery } = dashboardApi;