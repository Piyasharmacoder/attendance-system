import { apiSlice } from './apiSlice';

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 Punch In
    punchIn: builder.mutation({
      query: (data) => ({
        url: '/attendance/punch-in',   
        method: 'POST',               
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // 🔹 Punch Out
    punchOut: builder.mutation({
      query: (data) => ({
        url: '/attendance/punch-out', 
        method: 'POST',               
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // 🔹 Get Attendance
    getAttendance: builder.query({
      query: (params) => ({
        url: '/attendance',
        params,
      }),
      providesTags: ['Attendance'],
    }),

  }),

  overrideExisting: false,
});

export const {
  usePunchInMutation,
  usePunchOutMutation,
  useGetAttendanceQuery,
} = attendanceApi;