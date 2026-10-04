import type { Ticket } from "../models/ticket";

const API_URL = import.meta.env.VITE_API_URL;

//gets the users name through firebase ID
export async function getUserByFirebaseUid(firebaseUid: string): Promise<{name: string}> {
  const response = await fetch(`${API_URL}/User/user/${firebaseUid}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}

// GET ALL tickets
export async function getTickets(): Promise<Ticket[]> {
  const response = await fetch(`${API_URL}/Tickets`);

  if (!response.ok) {
    throw new Error("Failed to fetch tickets");
  }

  return response.json();
}

// GET ONE ticket
export async function getTicket(id: number): Promise<Ticket> {
  const response = await fetch(`${API_URL}/Tickets/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch ticket");
  }

  return response.json();
}

// CREATE a ticket
export async function createTicket(ticket: Ticket): Promise<Ticket> {
  const response = await fetch(`${API_URL}/Tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
  });

  if (!response.ok) {
    throw new Error("Failed to create ticket");
  }

  return response.json();
}

// UPDATE a ticket
export async function updateTicket(
  ticket: Ticket,
  id: number
): Promise<void> {
  const response = await fetch(`${API_URL}/Tickets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
  });

  if (!response.ok) {
    throw new Error("Failed to update ticket");
  }
}

// DELETE a ticket
export async function deleteTicket(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/Tickets/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete ticket");
  }
}

//UPLOAD an image 
export async function uploadTicketImage(
  file: File
): Promise<string> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_URL}/Tickets/upload-image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload ticket image");
  }

  const data = await response.json();

  return data.imageUrl;
}

export async function getOccupiedBays(): Promise<{ bayID: number; bayNumber: string }[]> {
  const response = await fetch(`${API_URL}/Parking/occupied`);
  if (!response.ok) throw new Error("Failed to fetch occupied bays");
  return response.json();
}