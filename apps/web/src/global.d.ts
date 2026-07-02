import 'react-router';
module 'virtual:load-fonts.jsx' {
  export function LoadFonts(): null;
}
declare module 'react-router' {
  interface AppLoadContext {
    // add context properties here
  }
}
declare module 'npm:stripe' {
  import Stripe from 'stripe';
  export default Stripe;
}
declare module '@auth/create/react' {
  import { SessionProvider } from '@auth/react';
  export { SessionProvider };
}
// Allow JSX files to be imported without type declarations
declare module '*.jsx' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}
declare module '*.js' {
  const value: any;
  export default value;
}
