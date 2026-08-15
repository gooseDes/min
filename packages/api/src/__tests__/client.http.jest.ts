import { testUrl } from "@/__mocks__/handlers";
import { ApiClient } from "@/client";
import { server } from "@/jest.setup";
import { describe, expect, it } from "@jest/globals";
import { http } from "msw";

const client = new ApiClient({ url: testUrl });

describe("ApiClient.login", () => {
  it("returns success:true and user data on success", async () => {
    const result = await client.login("user@example.com", "pass");

    expect(result).toEqual({
      success: true,
      token: "tok_123",
      user: { id: 1, email: "user@example.com", username: "user" },
    });
  });

  it("returns success:false and message on error", async () => {
    const result = await client.login("alice@example.com", "wrong");

    expect(result).toEqual({ success: false, message: "Invalid credentials" });
  });

  it("sends POST to /login with correct headers and body", async () => {
    let capturedRequest: Request | undefined;

    server.use(
      http.post(`${testUrl}/login`, async ({ request }) => {
        capturedRequest = request.clone();
        return;
      }),
    );

    await client.login("user@example.com", "pass");

    expect(capturedRequest!).toBeDefined();
    const body = await capturedRequest!.json();
    expect(body).toEqual({ email: "user@example.com", password: "pass" });
  });
});

describe("ApiClient.register", () => {
  it("returns success:true and user data on success", async () => {
    const result = await client.register("user2", "user2@example.com", "pass");

    expect(result).toEqual({
      success: true,
      token: "tok_456",
      user: { id: 2, email: "user2@example.com", username: "user2" },
    });
  });

  it("returns success:false and message if email or username is already in use", async () => {
    const result = await client.register("user", "user@example.com", "pass");

    expect(result).toEqual({ success: false, message: "Username or email already in use" });
  });

  it("sends POST to /register with correct headers and body", async () => {
    let capturedRequest: Request | undefined;

    server.use(
      http.post(`${testUrl}/register`, async ({ request }) => {
        capturedRequest = request.clone();
        return;
      }),
    );

    await client.register("user2", "user2@example.com", "pass");

    expect(capturedRequest!).toBeDefined();
    const body = await capturedRequest!.json();
    expect(body).toEqual({ username: "user2", email: "user2@example.com", password: "pass" });
  });
});

describe("ApiClient.verifyToken", () => {
  it("returns success:true and is_valid:true on success", async () => {
    const result = await client.verifyToken("tok_valid");

    expect(result).toEqual({ success: true, is_valid: true });
  });

  it("returns success:true and is_valid:false if token is invalid", async () => {
    const result = await client.verifyToken("tok_invalid");

    expect(result).toEqual({ success: true, is_valid: false });
  });

  it("sends POST to /verify with correct body", async () => {
    let capturedRequest: Request | undefined;

    server.use(
      http.post(`${testUrl}/verify`, async ({ request }) => {
        capturedRequest = request.clone();
        return;
      }),
    );

    await client.verifyToken("tok_valid");

    expect(capturedRequest!).toBeDefined();
    const body = await capturedRequest!.json();
    expect(body).toEqual({ token: "tok_valid" });
  });
});

describe("ApiClient.attachImage", () => {
  const image = new File(["dummy content"], "test.jpg", { type: "image/jpeg" });

  it("returns success:true on successful attachment", async () => {
    const result = await client.attachImage("tok_valid", image);

    expect(result).toEqual({ success: true, urls: ["https://example.com/image.webp"] });
  });

  it("returns success:false and message on failure", async () => {
    const result = await client.attachImage("tok_invalid", image);

    expect(result).toEqual({ success: false, message: "Unauthorized" });
  });

  it("sends POST to /attach with correct auth header", async () => {
    let capturedRequest: Request | undefined;

    server.use(
      http.post(`${testUrl}/attach`, async ({ request }) => {
        capturedRequest = request.clone();
        return;
      }),
    );

    await client.attachImage("tok_valid", image);

    expect(capturedRequest!).toBeDefined();
    expect(capturedRequest!.headers.get("Authorization")).toBe("Bearer tok_valid");
  });
});

describe("ApiClient.uploadAvatar", () => {
  const avatar = { uri: "file:///path/to/avatar.jpg", name: "avatar.jpg", type: "image/jpeg" };

  it("returns success:true on successful upload", async () => {
    const result = await client.uploadAvatar("tok_valid", avatar);

    expect(result).toEqual({
      success: true,
      url: "https://example.com/avatar_suffix.webp",
      avatar: "avatar_suffix",
    });
  });

  it("returns success:false and message on failure", async () => {
    const result = await client.uploadAvatar("tok_invalid", avatar);

    expect(result).toEqual({ success: false, message: "Unauthorized" });
  });

  it("sends POST to /upload-avatar with correct auth header", async () => {
    let capturedRequest: Request | undefined;

    server.use(
      http.post(`${testUrl}/upload-avatar`, async ({ request }) => {
        capturedRequest = request.clone();
        return;
      }),
    );

    await client.uploadAvatar("tok_valid", avatar);

    expect(capturedRequest!).toBeDefined();
    expect(capturedRequest!.headers.get("Authorization")).toBe("Bearer tok_valid");
  });
});
