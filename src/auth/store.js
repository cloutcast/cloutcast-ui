import {writable, derrived} from 'svelte/store';
export const authLoaded = writable(false);
export const isAuthenticated = writable(false);
export const user = writable({});
export const popupOpen = writable(false);
export const error = writable();

export const tasks = writable([]);

export const userToken = writable([]);

export const bitCloutUser = writable({});