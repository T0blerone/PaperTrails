export const NOTE_MAX_LENGTH = 800;

export function getUsers() {
  return [
    {
      id: "user-a",
      name: process.env.USER_A_NAME || "Toby",
      password: process.env.USER_A_PASSWORD || "paper-trails-a",
      deviceId: process.env.DEVICE_A_ID || "printer-a"
    },
    {
      id: "user-b",
      name: process.env.USER_B_NAME || "Partner",
      password: process.env.USER_B_PASSWORD || "paper-trails-b",
      deviceId: process.env.DEVICE_B_ID || "printer-b"
    }
  ];
}

export function getDevices() {
  return [
    {
      id: process.env.DEVICE_A_ID || "printer-a",
      label: `${process.env.USER_A_NAME || "Toby"}'s printer`,
      ownerUserId: "user-a",
      token: process.env.DEVICE_A_TOKEN || "dev-token-a"
    },
    {
      id: process.env.DEVICE_B_ID || "printer-b",
      label: `${process.env.USER_B_NAME || "Partner"}'s printer`,
      ownerUserId: "user-b",
      token: process.env.DEVICE_B_TOKEN || "dev-token-b"
    }
  ];
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    deviceId: user.deviceId
  };
}
