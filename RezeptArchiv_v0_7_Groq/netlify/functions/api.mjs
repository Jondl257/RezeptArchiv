import {createApi} from '../../server/api.mjs';
const handler=createApi();
export default async request=>handler(request);
export const config={path:'/api/*'};
