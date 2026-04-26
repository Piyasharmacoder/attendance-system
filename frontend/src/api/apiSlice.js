import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Attendance', 'Overtime', 'Report'],
  endpoints: (builder) => ({

    login: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
    }),


    // 1.  'register' endpoint 
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    getUsers: builder.query({
      query: () => '/auth/users',
      providesTags: ['User'],
    }),

    getManagers: builder.query({
      query: () => '/auth/managers',
      providesTags: ['User'],
    }),

    getUserDetails: builder.query({
      query: (id) => `/auth/users/${id}/details`,
      providesTags: ['User', 'Attendance'],
    }),

    updateUser: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/auth/users/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['User', 'Attendance'],
    }),

    createUser: builder.mutation({
      query: (payload) => ({
        url: '/users',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUsersQuery,
  useGetManagersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useCreateUserMutation,
} = apiSlice;