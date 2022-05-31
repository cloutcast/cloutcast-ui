import {writable} from 'svelte/store';


export const cloutXRate = writable({});

export const storeJSON = writable([]);

export const toggleDetail = writable(0);

export const toggleCreate = writable(false);

export const toggleLogin = writable(false);


export const userStore = writable(null);

export const loginDone = writable(false);

export const mobileAuth = writable(false);

export const passWindow = writable(null);

export const toggleMobileMenu = writable(null);

export const toggleInboxMenu = writable(null);

export const toggleTheme = writable(null);

export const theUsernameObject = writable(null);