/**
  Microservice hosts.
  Format:
    "microservice" : "host name"
  or
    "microservice" : [
      {
        "server" : "host name1",
        "weight": 3
      },
      {
        "server" : "host name1",
        "weight": 3
      }
    ]
*/
module.exports.microservices = {
  allInclusive: 'dev.grdnz.com',
  integrationAPI: 'dev.grdnz.com',
  integrationAPIAuthToken: 'testtokenforgas',
  analytics: 'analytics.dev.grdnz.com:3000',
  mondrian: 'mdx.dev.grdnz.com:8080/mdx',
  GAA: 'dev.grdnz.com',
  apiGateway: 'dev.grdnz.com',
  druid: 'analytics.dev.grdnz.com:8082'
};
