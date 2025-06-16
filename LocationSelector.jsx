import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { nanoid } from "nanoid";
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AhmedabadIcon, DelhiIcon, KolkataIcon, LocationPrimary, LocationSelectorBgPattern, LocationSelectorBgPatternMobile, LocatioPinIcon, MumbaiIcon, BangloreIcon, HyderabadIcon, DeleteIcon } from '../../assets';

import { useMediaQuery } from 'react-responsive';
import useGooglePlaces from '../../hooks/useGooglePlaces.jsx';
import { setLocation, setLocationError } from '../../store/reducers/location-slice.js';
import LocationSearchInput from '../LocationSearchInput/LocationSearchInput.jsx';

const selectLocation = [
  {
    hidden: false,
    name: 'Mumbai',
    icon: MumbaiIcon,
    formatted_address: 'Mumbai, Maharashtra, India',
    latitude: 19.0760,
    longitude: 72.8777,
    place_id: "ChIJwe1EZjDG5zsRaYxkjY_tpF0",
    city: 'Mumbai',
  },
  {
    hidden: false,
    name: 'Kolkata',
    icon: KolkataIcon,
    formatted_address: 'Kolkata, West Bengal, India',
    latitude: 22.5626,
    longitude: 88.3630,
    place_id: "ChIJZ_YISduC-DkRvCxsj-Yw40M",
    city: 'Kolkata',
  },
  {
    hidden: false,
    name: 'Delhi',
    icon: DelhiIcon,
    formatted_address: 'Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    place_id: "ChIJLbZ-NFv9DDkRQJY4FbcFcgM",
    city: 'Delhi',
  },
  {
    hidden: false,
    name: 'Ahmedabad',
    icon: AhmedabadIcon,
    formatted_address: 'Ahmedabad, Gujarat, India',
    latitude: 23.0225,
    longitude: 72.5792,
    place_id: "ChIJSdRbuoqEXjkRFmVPYRHdzk8",
    city: 'Ahmedabad',
  },
  {
    hidden: false,
    name: 'Bengaluru',
    icon: BangloreIcon,
    formatted_address: 'Bengaluru, Karnataka, India',
    latitude: 12.97159,
    longitude: 77.5945,
    place_id: "ChIJbU60yXAWrjsR4E9-UejD3_g",
    city: 'Bengaluru',
  },
  {
    hidden: false,
    name: 'Hyderabad',
    icon: HyderabadIcon,
    formatted_address: 'Hyderabad, Telangana, India',
    latitude: 17.4064,
    longitude: 78.477,
    place_id: "ChIJx9Lr6tqZyzsRwvu6koO3k64",
    city: 'Hyderabad',
  },
];

// eslint-disable-next-line react/prop-types
const LocationSelector = ({ className }) => {
  const { getPlaceDetailsByLatLng } = useGooglePlaces();
  const [isOpen, setIsOpen] = useState(false);
  const [isGeoLocationSupported, setIsGeoLocationSupported] = useState(true);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const location = useSelector((state) => state.location);
  const error = useSelector((state) => state.location.error);
  const [externalCoordinates, setExternalCoordinates] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to ensure overflow is restored when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleGetLocation = (callbackFn) => {
    setIsLoading(true)
    if (!navigator.geolocation) {
      setIsGeoLocationSupported(!navigator.geolocation);
      dispatch(setLocationError('GeoLocation is not supported by your browser'));
      return;
    }

    function successOnGeoLocation(position) {
      (async () => {
        try {
          const geoLocationObj = await getPlaceDetailsByLatLng(position.coords.latitude, position.coords.longitude); // Example coordinates
          dispatch(setLocation(geoLocationObj));
          dispatch(setLocationError(null));
          if (callbackFn) {
            setTimeout(() => {
              callbackFn();
              setIsLoading(false);
            }, 500);
          }
        } catch (error) {
          setIsGeoLocationSupported(false); 
          dispatch(setLocationError(error.message));
        } 
      })();
    }

    function errorOnGeoLocation(error) {
      dispatch(setLocationError(error.message));
      setIsLoading(false);
    }

    navigator.geolocation.getCurrentPosition(successOnGeoLocation, errorOnGeoLocation);
  };

  const handleSelectLocation = (location, callbackFn) => {
    dispatch(setLocation({
      formatted_address: location.formatted_address,
      lat: location.latitude,
      lng: location.longitude,
      name: location.name,
      place_id: location.place_id,
      city: location.city
    }));
    dispatch(setLocationError(null));

    if (callbackFn) callbackFn();
  };

  // NEW: External JavaScript Integration - Indirect triggering of getPlaceDetailsByLatLng
    useEffect(() => {
      // Auto-trigger reverse geocoding for externally provided coordinates
      if (externalCoordinates && externalCoordinates.lat && externalCoordinates.lng) {
        setIsLoading(true);
  
        (async () => {
          try {
            const geoLocationObj = await getPlaceDetailsByLatLng(externalCoordinates.lat, externalCoordinates.lng);
            dispatch(setLocation(geoLocationObj));
            dispatch(setLocationError(null));
            setIsLoading(false);
            // Clear external coordinates after successful processing
            setExternalCoordinates(null);
            setIsOpen(false);
          } catch (error) {
            dispatch(setLocationError(error.message));
            setIsLoading(false);
            // Clear external coordinates even on error
            setExternalCoordinates(null);
          }
        })();
      }
    }, [externalCoordinates, getPlaceDetailsByLatLng, dispatch]);
  
    // NEW: External JavaScript Integration - Window object exposure for GPS-based external scripts
    useEffect(() => {
      // Expose GPS-focused functions to window object for external JavaScript access
  
      // GPS Coordinate Data Function (coordinates only)
      window.setLocationData = (locationData) => {
        // Accept lat/lng coordinates from external scripts, ignore all other properties
        if (locationData.lat && locationData.lng) {
          // Extract only coordinates, reject formatted_address, name, place_id, city, etc.
          setExternalCoordinates({
            lat: locationData.lat,
            lng: locationData.lng
          });
          dispatch(setLocationError(null));
        } else {
        }
      };
  
      // Error State Management
      window.setLocationError = (errorMessage) => {
        dispatch(setLocationError(errorMessage));
      };
  
      // Loading State Control
      window.setLocationLoading = (loading) => {
        setIsLoading(loading);
      };
  
      // Loading State Access
      window.getIsLoading = () => {
        return isLoading;
      };
  
      // UI Control Functions
      window.closeLocationPopover = () => {
        setIsOpen(false);
      };
  
      // Popover State Access
      window.getIsOpen = () => {
        return isOpen;
      };
  
      // Cleanup function to remove all exposed functions when component unmounts
      return () => {
        delete window.setLocationData;
        delete window.setLocationError;
        delete window.setLocationLoading;
        delete window.getIsLoading;
        delete window.closeLocationPopover;
        delete window.getIsOpen;
      };
    }, [dispatch, isOpen, isLoading]);

  return (
    <Popover className={`${className} relative flex items-center group`}>
      {({ open }) => {
        // Update isOpen state when Popover state changes
        useEffect(() => {
          setIsOpen(open);
        }, [open]);
        return (
          <>
            <PopoverButton className="flex items-center text-gray-800 gap-[5.3px] p-0 md:px-[13px] md:py-[9.5px] md:border md:border-transparent md:rounded-full md:hover:border-383838 data-[open]:border-383838 data-[open]:rounded-full focus:outline-hidden">
              <img src={LocationPrimary} alt="Location Pin Icon" className="fill-56b918 w-auto h-[33.6px] md:h-[15px]"></img>
              <div className="flex flex-col items-start">
                <p className="md:underline font-medium text-base md:text-sm font-general text-383838 capitalize truncate ... max-w-40">
                  {location.name + ' - ' + location.formatted_address}
                </p>
                <p className="md:hidden opacity-50 md:opacity-100 underline font-medium text-sm font-general text-383838 capitalize truncate ... max-w-48">
                  {location.name + ' - ' + location.formatted_address}
                </p>
              </div>
            </PopoverButton>

            <PopoverPanel transition className="overflow-y-auto md:overflow-y-visible auto fixed top-0 left-0 z-60 w-screen h-screen md:fixed lg:absolute md:top-[55px] md:mt-3 md:h-[unset] md:left-1/2 md:-translate-x-1/2 lg:translate-x-0 md:max-w-1/2 lg:max-w-[911px] lg:-left-44 bg-transparent shadow-level-1 transition data-[closed]:-translate-y-full data-[closed]:md:-translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in">
              {({ close }) => (
                <>
                  <div className="flex items-end relative w-full h-52 md:h-28 md:items-start bg-gradient-to-b from-ffffff to-f4f5ff bg-no-repeat px-10 py-[50px] md:py-9 overflow-hidden border-b border-f0f0f0 md:rounded-tl-[20px] md:rounded-tr-[20px]">
                    <img src={LocationSelectorBgPattern} className="hidden md:block absolute top-0 right-0" alt="Pattern for UI " />
                    <div className='top-[10px] right-[10px] absolute z-50' onClick={close}>
                    <img src={DeleteIcon} className="" alt="close-icon" />
                    </div>
                    <img src={LocationSelectorBgPatternMobile} className="block md:hidden absolute top-0 right-0" alt="Pattern for UI " />

                    <div className="flex flex-col gap-1">
                      <p className="text-383838 text-left font-medium text-sm tracking-normal opacity-70 font-general">
                        Your Default Location is Set to
                      </p>
                      <div className="flex items-center justify-start gap-1 z-10">
                        <MapPinIcon className="size-5 flex-none fill-56b918"></MapPinIcon>
                        <p className="text-383838 font-medium text-2xl leading-6 tracking-normal font-author">{location.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white px-[15px] py-6 md:py-5 md:px-9 gap-[10px] flex flex-col md:rounded-bl-[20px] md:rounded-br-[20px]">
                    <div className='flex items-center justify-between gap-[10px] md:gap-0'>
                      <p className="px-5 md:px-0 text-383838 text-left font-medium text-base tracking-normal opacity-70 font-general text-">
                        Select Your City
                      </p>
                    </div>

                    <div className="px-5 md:px-0 flex items-start justify-between gap-[12px] md:gap-9 flex-col lg:flex-row">
                      <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-3 grow shrink w-full lg:max-w-[404px]">
                        {selectLocation.map((location, index) => {
                          if (location.hidden) return null;
                          return (
                            <div
                              className="flex items-center justify-center flex-col gap-1 p-1 aspect-square border border-f2f2f2 rounded-[10px] bg-white hover:border-dbe0fc hover:shadow-level-1"
                              key={nanoid()}
                              onClick={() => handleSelectLocation(location, close)}
                            >
                              <img src={location.icon} alt={location.name} />
                              <p className="text-xs md:text-sm font-general text-383838 opacity-70">{location.name}</p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="hidden h-0 w-full lg:h-[146px] lg:w-0 lg:mt-4 md:block border-[0.5px] border-dbe0fc md:border-707070 opacity-20 rounded-xs"></div>

                      <div className="flex flex-col justify-between items-start gap-3 md:gap-4 mt-3 md:mt-0">
                        <div className="flex flex-col justify-start gap-1">
                          <p className="text-2xl font-author font-medium text-383838 capitalize">Enter Location</p>
                          <p className="request-access text-383838 text-left font-medium text-sm tracking-normal opacity-70 font-general">
                            Allow Location for better search results and personalized recommendations
                          </p>
                        </div>

                        <button className="flex flex-col gap-2" onClick={() => handleGetLocation(close)}>
                          {isGeoLocationSupported && (
                            <div className="flex gap-1 items-center">
                              <img src={LocatioPinIcon} alt="Location Pin Icon" />
                              <p className="currentLocation-access text-244cb4 text-sm font-medium opacity-70 font-general capitalize">
                                Use My Current Location
                              </p>
                            </div>
                          )}
                          {isLoading && (
                            <div className="fetching-access flex gap-2 items-center text-gray-500 text-sm">
                              <svg className="animate-spin h-4 w-4 text-244cb4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              <span className='fetching-access'>Fetching location...</span>
                            </div>
                          )}
                          {error && <p className="denied-access text-red-500 text-left font-medium text-sm tracking-normal opacity-70 font-general capitalize">{error}</p>}
                        </button>

                        <div className="h-0 w-full block md:hidden border-[0.5px] border-dbe0fc md:border-707070 opacity-20 rounded-xs"></div>
                        {!isMobile && <LocationSearchInput closePopOverCallback={close}></LocationSearchInput>}
                      </div>
                    </div>

                    {isMobile && <LocationSearchInput closePopOverCallback={close}></LocationSearchInput>}
                  </div>
                </>
              )}
            </PopoverPanel>
          </>
        );
      }}
    </Popover>
  );
};

export default LocationSelector;
