import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    formatted_address: 'Mumbai, Maharashtra, India',
    lat: 19.0760,
    lng: 72.8777,
    name: 'Mumbai',
    place_id: 'ChIJLbZ-ChIJwe1EZjDG5zsRaYxkjY_tpF0',
    error: null,
    loading: false,
    city: 'Mumbai',
}

const locationSlice = createSlice({
  name: 'Location',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.formatted_address = action.payload.formatted_address;
      state.lat = action.payload.lat;
      state.lng = action.payload.lng;
      state.name = action.payload.name;
      state.place_id = action.payload.place_id;
      state.city = action.payload.city;
    },
    setLocationError: (state, action) => {
      state.error = action.payload;
    },
    setLocationLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setLocation, setLocationError, setLocationLoading } = locationSlice.actions;

export default locationSlice.reducer;
