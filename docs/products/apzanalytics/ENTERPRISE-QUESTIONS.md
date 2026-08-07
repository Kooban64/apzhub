# APZ Analytics — Enterprise Questions

| Field     | Value                                                                        |
| --------- | ---------------------------------------------------------------------------- |
| Programme | APZ-ANALYTICS-000                                                            |
| Status    | **APPROVED**                                                                 |
| Timestamp | 20260805T174500Z                                                             |
| Board     | [PRODUCT-BOARD-ENTERPRISE-INSIGHT.md](./PRODUCT-BOARD-ENTERPRISE-INSIGHT.md) |

## Rule

> Business questions come before visualisations.

These questions define the product. Charts do not.

None of these ask “which chart?”

## Executive

| ID     | Question                    |
| ------ | --------------------------- |
| EQ-E01 | Are projects healthy?       |
| EQ-E02 | Where is work blocked?      |
| EQ-E03 | Which teams are overloaded? |

## Manager

| ID     | Question               |
| ------ | ---------------------- |
| EQ-M01 | Is delivery improving? |
| EQ-M02 | Where are bottlenecks? |
| EQ-M03 | Are SLAs improving?    |

## Support

| ID     | Question                      |
| ------ | ----------------------------- |
| EQ-S01 | What causes repeat incidents? |

## Project

| ID     | Question                    |
| ------ | --------------------------- |
| EQ-P01 | Which projects are at risk? |

## Quality

| ID     | Question                     |
| ------ | ---------------------------- |
| EQ-Q01 | Are releases becoming safer? |

## Time

| ID     | Question                     |
| ------ | ---------------------------- |
| EQ-T01 | Where is effort being spent? |

## Workflow

| ID     | Question                               |
| ------ | -------------------------------------- |
| EQ-W01 | Which processes create the most delay? |

## Observes (never owns)

| Question family               | Observes SoR / baseline |
| ----------------------------- | ----------------------- |
| Executive / Project / Manager | APZ Projects            |
| Support / Manager             | APZ Support             |
| Time                          | APZ Time                |
| Quality                       | APZQEP                  |
| Workflow                      | APZ Workflow            |
| Cross-cutting health          | All RI products         |

## Extension rule

New Analytics scope must introduce or refine a **business question** that advances a decision or outcome. “Add a dashboard” is not a valid scope driver.
