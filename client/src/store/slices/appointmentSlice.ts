import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Appointment {
  _id: string;
  patient: string;
  provider: string;
  treatment: {
    _id: string;
    name: string;
    duration: number;
  };
  treatmentPlan?: string;
  date: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: {
    preAppointment?: string;
    postAppointment?: string;
  };
  location?: string;
  followUp?: {
    recommended: boolean;
    daysAfter?: number;
    recommendedTreatment?: string;
    booked: boolean;
    followUpAppointment?: string;
  };
  feedbackSubmitted: boolean;
}

interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  isLoading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get('/api/appointments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(`/api/appointments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData: Partial<Appointment>, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.post('/api/appointments', appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async (
    { id, appointmentData }: { id: string; appointmentData: Partial<Appointment> },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.put(`/api/appointments/${id}`, appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.put(
        `/api/appointments/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all appointments
    builder.addCase(fetchAppointments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
      state.isLoading = false;
      state.appointments = action.payload;
    });
    builder.addCase(fetchAppointments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch appointment by ID
    builder.addCase(fetchAppointmentById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAppointmentById.fulfilled, (state, action: PayloadAction<Appointment>) => {
      state.isLoading = false;
      state.currentAppointment = action.payload;
    });
    builder.addCase(fetchAppointmentById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create appointment
    builder.addCase(createAppointment.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
      state.isLoading = false;
      state.appointments.push(action.payload);
      state.currentAppointment = action.payload;
    });
    builder.addCase(createAppointment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update appointment
    builder.addCase(updateAppointment.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
      state.isLoading = false;
      state.appointments = state.appointments.map((appointment) =>
        appointment._id === action.payload._id ? action.payload : appointment
      );
      state.currentAppointment = action.payload;
    });
    builder.addCase(updateAppointment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Cancel appointment
    builder.addCase(cancelAppointment.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cancelAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
      state.isLoading = false;
      state.appointments = state.appointments.map((appointment) =>
        appointment._id === action.payload._id ? action.payload : appointment
      );
      if (state.currentAppointment && state.currentAppointment._id === action.payload._id) {
        state.currentAppointment = action.payload;
      }
    });
    builder.addCase(cancelAppointment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentAppointment, clearError } = appointmentSlice.actions;

export default appointmentSlice.reducer;