import { apiSlice } from './apiSlice';

export const overtimeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 Request OT
    requestOvertime: builder.mutation({
      query: (data) => ({
        url: '/overtime/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Overtime'],
    }),

    // 🔹 Get OT
    getOvertimeRequests: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.status && params.status !== "All") {
          searchParams.append("status", params.status);
        }
        if (params.startDate) {
          searchParams.append("startDate", params.startDate);
        }
        if (params.endDate) {
          searchParams.append("endDate", params.endDate);
        }

        const queryString = searchParams.toString();
        return queryString ? `/overtime?${queryString}` : "/overtime";
      },
      providesTags: ['Overtime'],
    }),

    // 🔹 Update OT
    updateOvertimeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/overtime/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Overtime'],
    }),

  }),
});

export const {
  useRequestOvertimeMutation,
  useGetOvertimeRequestsQuery,
  useUpdateOvertimeStatusMutation,
} = overtimeApi;