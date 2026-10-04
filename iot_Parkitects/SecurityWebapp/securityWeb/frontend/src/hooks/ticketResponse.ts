import { useEffect, useState } from "react";
import type { Ticket } from "../models/ticket";
import { getTickets } from "../services/api";

export function useTicketPolling(intervalMs = 5000) {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    let active = true;
    const fetchTickets = async () => {
      try {
        const data = await getTickets();
        if (active) setTickets(data);
      } catch (error) {
        console.error("error getting tickets", error);
      }
    };
    fetchTickets();
    const id = setInterval(fetchTickets, intervalMs);
    return () => { active = false; clearInterval(id); };
  }, [intervalMs]);

  return tickets;
}