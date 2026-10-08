import { describe, expect, it } from "vitest";
import { UserRole } from "@/core/domain/user";
import { UserFactory } from "@/infrastructure/factories/user.factory";

describe("UserFactory.toAccount", () => {
    it("should create an active user account", () => {
        const result = UserFactory.toAccount({
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            image: null,
            role: "USER",
            banReason: null,
            banExpires: null,
        },
        {
            status: "ACTIVE",
            gameCount: 5,
        });

        expect(result).toEqual({
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            image: null,
            role: "USER",
            status: "ACTIVE",
            gameCount: 5,
            suspension: {
                startDate: null,
                endDate: null,
            },
            reason: "",
        });
    });

    it("should include suspension end date for suspended user", () => {
        const banExpires =
            new Date("2099-12-31T00:00:00.000Z");

        const result = UserFactory.toAccount({
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            image: null,
            role: "USER",
            banReason: "Violation",
            banExpires,
        },
        {
            status: "SUSPENDED",
            gameCount: 2,
        });

        expect(result.status).toBe("SUSPENDED");
        expect(result.gameCount).toBe(2);
        expect(result.reason).toBe("Violation");
        expect(result.suspension.endDate,).toBe("2099-12-31T00:00:00.000Z");
    });

    it("should not include ban expiry for ACTIVE user", () => {
        const result = UserFactory.toAccount({
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            image: null,
            role: "USER",
            banReason: "Old reason",
            banExpires:
                new Date("2099-12-31T00:00:00.000Z")
        },
        {
            status: "ACTIVE",
            gameCount: 1,
        },
    );
    expect(result.suspension.endDate,).toBeNull();
    });

    it("should use USER role when role is undefined", () => {
        const result = UserFactory.toAccount(
            {
                id: "user-1",
                name: "John Doe",
                email: "john@example.com",
                role: undefined,
            },
            {
                status: "ACTIVE",
                gameCount: 0,
            },
        );

        expect(result.role).toBe(UserRole.USER);
    });
});