import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface TreatmentPlan {
  _id: string;
  name: string;
  patient: string;
  provider: string;
  goal: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled' | 'on-hold';
  treatments: {
    treatment: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    notes?: string;
    completed: number;
    scheduled: number;
  }[];
  totalPrice: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  finalPrice: number;
  paymentMethod?: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  progressTracking?: {
    date: string;
    notes: string;
    imageUrls?: string[];
  }[];
}

interface TreatmentPlanState {
  treatmentPlans: TreatmentPlan[];
  currentTreatmentPlan: TreatmentPlan | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TreatmentPlanState = {
  treatmentPlans: [],
  currentTreatmentPlan: null,
  isLoading: false,
  error: null,
};

export const fetchTreatmentPlans = createAsyncThunk(
  'treatmentPlans/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get('/api/treatment-plans', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch treatment plans');
    }
  }
);

export const fetchTreatmentPlanById = createAsyncThunk(
  'treatmentPlans/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(`/api/treatment-plans/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch treatment plan');
    }
  }
);

export const createTreatmentPlan = createAsyncThunk(
  'treatmentPlans/create',
  async (planData: Partial<TreatmentPlan>, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.post('/api/treatment-plans', planData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create treatment plan');
    }
  }
);

export const updateTreatmentPlan = createAsyncThunk(
  'treatmentPlans/update',
  async (
    { id, planData }: { id: string; planData: Partial<TreatmentPlan> },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.put(`/api/treatment-plans/${id}`, planData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update treatment plan');
    }
  }
);

export const addProgressTrackingEntry = createAsyncThunk(
  'treatmentPlans/addProgressTracking',
  async (
    {
      id,
      progressData,
    }: {
      id: string;
      progressData: { notes: string; imageUrls?: string[] };
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.post(`/api/treatment-plans/${id}/progress`, progressData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add progress tracking entry'
      );
    }
  }
);

const treatmentPlanSlice = createSlice({
  name: 'treatmentPlans',
  initialState,
  reducers: {
    clearCurrentTreatmentPlan: (state) => {
      state.currentTreatmentPlan = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all treatment plans
    builder.addCase(fetchTreatmentPlans.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchTreatmentPlans.fulfilled,
      (state, action: PayloadAction<TreatmentPlan[]>) => {
        state.isLoading = false;
        state.treatmentPlans = action.payload;
      }
    );
    builder.addCase(fetchTreatmentPlans.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch treatment plan by ID
    builder.addCase(fetchTreatmentPlanById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchTreatmentPlanById.fulfilled,
      (state, action: PayloadAction<TreatmentPlan>) => {
        state.isLoading = false;
        state.currentTreatmentPlan = action.payload;
      }
    );
    builder.addCase(fetchTreatmentPlanById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create treatment plan
    builder.addCase(createTreatmentPlan.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      createTreatmentPlan.fulfilled,
      (state, action: PayloadAction<TreatmentPlan>) => {
        state.isLoading = false;
        state.treatmentPlans.push(action.payload);
        state.currentTreatmentPlan = action.payload;
      }
    );
    builder.addCase(createTreatmentPlan.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update treatment plan
    builder.addCase(updateTreatmentPlan.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      updateTreatmentPlan.fulfilled,
      (state, action: PayloadAction<TreatmentPlan>) => {
        state.isLoading = false;
        state.treatmentPlans = state.treatmentPlans.map((plan) =>
          plan._id === action.payload._id ? action.payload : plan
        );
        state.currentTreatmentPlan = action.payload;
      }
    );
    builder.addCase(updateTreatmentPlan.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add progress tracking entry
    builder.addCase(addProgressTrackingEntry.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      addProgressTrackingEntry.fulfilled,
      (state, action: PayloadAction<TreatmentPlan>) => {
        state.isLoading = false;
        state.treatmentPlans = state.treatmentPlans.map((plan) =>
          plan._id === action.payload._id ? action.payload : plan
        );
        state.currentTreatmentPlan = action.payload;
      }
    );
    builder.addCase(addProgressTrackingEntry.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentTreatmentPlan, clearError } = treatmentPlanSlice.actions;

export default treatmentPlanSlice.reducer;