// package: 
// file: geo-me.proto

var geo_me_pb = require("./geo-me_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var ServiceDefinition = (function () {
  function ServiceDefinition() {}
  ServiceDefinition.serviceName = "ServiceDefinition";
  return ServiceDefinition;
}());

ServiceDefinition.geoFixMe = {
  methodName: "geoFixMe",
  service: ServiceDefinition,
  requestStream: false,
  responseStream: false,
  requestType: geo_me_pb.GeoRequest,
  responseType: geo_me_pb.GeolocationResult
};

exports.ServiceDefinition = ServiceDefinition;

function ServiceDefinitionClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

ServiceDefinitionClient.prototype.geoFixMe = function geoFixMe(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ServiceDefinition.geoFixMe, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.ServiceDefinitionClient = ServiceDefinitionClient;

