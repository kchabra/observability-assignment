const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");

// instrumentations for tracking stuff like http req, mongodb queries,etc
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

const { JaegerExporter } = require("@opentelemetry/exporter-jaeger"); //for sending traces to jaeger

module.exports = (serviceName) => {
    //setting up tracing provider
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });
//sending traces to jaeger
    const jaegerExporter = new JaegerExporter({
        endpoint: 'http://localhost:14268/api/traces', 
    });


    provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
    provider.register();
//for tracking requests and queries
    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });

    return trace.getTracer(serviceName);
};