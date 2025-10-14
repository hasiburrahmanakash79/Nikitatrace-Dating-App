export const loginUrl = "/administration/auth/sign-in/";
export const refreshTokenUrl = "/auth/refresh/";
export const dashboardUrl = "/administration/dashboard/analytics/";
export const deleteUserUrl = (userId) => `/administration/user/retrieve-update-delete/${userId}/`;
export const userListUrl = "/administration/user/list/";
export const subscriptionUrl = "/administration/subscription/analytics/"; // Fixed typo: subscriptionUlr -> subscriptionUrl
export const profileInformationUrl = "/administration/profile/retrieve/"; // Fixed typo: profileInformationUlr -> profileInformationUrl
export const siteSettingsUrl = "/administration/site/settings/";
export const fetchAdUrl = "/administration/ad/fetch/";
export const createAddUrl = "/administration/ad/create/";
export const editAdUrl = "/administration/ad/update/";
export const deleteAdUrl = (adId) => `/administration/ad/delete/${adId}/`;