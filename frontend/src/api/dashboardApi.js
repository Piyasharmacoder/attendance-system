import { apiSlice } from './apiSlice';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 Dynamic Dashboard (role based)
    getDashboard: builder.query({
      query: (role) => {
        switch (role) {
          case 'manager':
            return '/dashboard/manager';

          case 'admin':
            return '/dashboard/admin';

          default:
            return '/dashboard/employee';
        }
      },
      providesTags: ['Report'],
    }),

  }),

  overrideExisting: false,
});

export const { useGetDashboardQuery } = dashboardApi;