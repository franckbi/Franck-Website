declare module '@sentry/nextjs' {
  // Minimal ambient declaration so the project can compile when the package
  // isn't installed in the build environment (we treat Sentry as optional).
  // If you later install @sentry/nextjs you can remove this file and use the
  // upstream types instead for better type-safety.

  const Sentry: any;
  export = Sentry;
}
