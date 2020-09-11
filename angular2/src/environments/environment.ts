// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const env = {
  production: false,
  mongoUrl: 'https://mlab-api.herokuapp.com/api/1/databases/myseiyuulist',
  seiyuuDB: 'seiyuu-test',
  apiKey: 'GnealBC8Fn-qf03VHO8BAhQBiql-z6Q60', // pls no steal
  koeurl: 'https://koe.booru.org/index.php?page=post&s=list&tags=',
  loglevel: 2,
  theSite: 'myanimelist.net',
  emptyInCatch: false,
  sentryDsn: "https://b377e6724d8848deb1fc68970c0f27ae@sentry.io/1823789"
};
