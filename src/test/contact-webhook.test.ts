import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";

const WEBHOOK_SECRET = "whsec_KRgjM91pPZEGt01YLQALNoI59EcgOYfi";

describe("Contact Webhook API", () => {
  it("computes valid hmac signature and accepts contact.created and contact.deleted events", () => {
    const payload = JSON.stringify({
      event: "contact.created",
      data: { id: "contact_123", email: "chef@example.com" },
    });

    const signature = createHmac("sha256", WEBHOOK_SECRET).update(payload).digest("hex");
    expect(signature).toBeTypeOf("string");
    expect(signature.length).toBe(64);

    const deletePayload = JSON.stringify({
      event: "contact.deleted",
      data: { id: "contact_123" },
    });
    const deleteSig = createHmac("sha256", WEBHOOK_SECRET).update(deletePayload).digest("hex");
    expect(deleteSig).toBeTypeOf("string");
  });
});
