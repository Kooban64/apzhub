# Transport Abstraction — APZQEP-120-S08

## Contract

```ts
type DeliveryPort = {
  readonly name: string;
  deliver(event: OutboxEvent): Promise<DeliveryResult>;
};

type TransportAdapter = DeliveryPort;
```

## S08 implementation

| Adapter                      | Behaviour                                    |
| ---------------------------- | -------------------------------------------- |
| `createNullTransportAdapter` | Acknowledges delivery; no external messaging |

## Explicitly out of scope

Kafka · RabbitMQ · NATS · SNS · SQS · Redis Streams · Cloud Event Bus · any external transport.

## Future providers

Implement `DeliveryPort` only. No changes to Application Services, catalogue, or outbox state machine required.

## Composition

```ts
createReliableDeliveryPlatform({
  store,
  transport: createNullTransportAdapter(), // or future adapter
});
```
