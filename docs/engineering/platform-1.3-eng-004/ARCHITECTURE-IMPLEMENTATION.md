# Architecture Implementation

Presentation → Platform Services (Notification Delivery) → in-app adapter (provider abstraction).

Products and Workbench never call providers. Observe/Support retain domain state. Delivery state owned by Notification Delivery. No new architectural layer. Integration SDK 1.0.0 unchanged.
