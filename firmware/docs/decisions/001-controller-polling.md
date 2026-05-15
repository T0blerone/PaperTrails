# Decision: Printer Controller Uses Polling

## Decision

The D1 mini controller will poll the webserver roughly once per minute for pending messages.

## Reasoning

Polling is simpler and more reliable for this hardware than keeping a persistent connection open.

The device is constrained, may have unreliable Wi-Fi, and only needs near-real-time delivery. A delay of up to about one minute is acceptable for this project.

## Consequences

- Server needs a polling endpoint.
- Device needs a token or secret.
- Server should avoid returning the same message repeatedly after it has been claimed or printed.
- Future improvements could include backoff, retries, or push-style delivery, but those are not required initially.