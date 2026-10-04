//(rudderz243,2026)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketPolling } from "../hooks/ticketResponse";
import { updateTicket, deleteTicket, getUserByFirebaseUid } from "../services/api";

export const TicketResponsesPage: React.FC = () => {
  const navigate = useNavigate();
  const tickets = useTicketPolling();
  const responses = tickets.filter((t) => t.status === "Awaiting review");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});

  const activeTicket = responses.find((t) => t.ticketID === selectedId) ?? responses[0] ?? null;

  // Resolve each unique driver's name once, cache it locally (rudderz243, 2026)
  useEffect(() => {
    const missing = [...new Set(responses.map((t) => t.userID))].filter(
      (uid) => uid && !(uid in names)
    );
    if (missing.length === 0) return;

    missing.forEach(async (uid) => {
      try {
        const user = await getUserByFirebaseUid(uid);
        setNames((prev) => ({ ...prev, [uid]: user.name }));
      } catch {
        setNames((prev) => ({ ...prev, [uid]: "Unknown driver" }));
      }
    });
  }, [responses, names]);

  const driverName = (userID: string) => names[userID] ?? "Loading…";
  const initialsFor = (name: string) =>
    name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const handleRejectResponse = async () => {
    if (!activeTicket) return;
    await updateTicket({ ...activeTicket, status: "Notified" }, activeTicket.ticketID);
    navigate("/tickets");
  };

  const handleMarkDone = async () => {
    if (!activeTicket) return;
    await deleteTicket(activeTicket.ticketID);
    navigate("/tickets");
  };

  return (
    <div className="app-shell">
      <div className="workspace">
        <section className="page is-active" aria-labelledby="ticketResponsesTitle">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Parking violations</p>
              <h1 id="ticketResponsesTitle">Ticket Responses</h1>
              <p>Review responses from drivers regarding issued parking tickets.</p>
            </div>
            <button className="button primary" type="button" onClick={() => navigate("/tickets")}>
              View tickets
            </button>
          </div>

          <div className="inbox panel">
            <div className="conversation-list">
              {responses.length === 0 && <p role="status">No responses waiting for review.</p>}

              {responses.map((ticket) => {
                const name = driverName(ticket.userID);
                return (
                  <button
                    key={ticket.ticketID}
                    className={`conversation searchable ${activeTicket?.ticketID === ticket.ticketID ? "is-active" : ""}`}
                    type="button"
                    data-search={`${name} ticket ${ticket.ticketID} bay ${ticket.bayNumber} ${ticket.reason}`}
                    onClick={() => setSelectedId(ticket.ticketID)}
                  >
                    <span className="mini-avatar purple">{initialsFor(name)}</span>
                    <span>
                      <strong>{name}</strong>
                      <small>{ticket.response}</small>
                    </span>
                    <time>{new Date(ticket.updatedAt ?? ticket.createdAt).toLocaleTimeString()}</time>
                  </button>
                );
              })}
            </div>

            <div className="message-thread">
              {activeTicket ? (
                <>
                  <div className="thread-heading">
                    <span className="mini-avatar purple">
                      {initialsFor(driverName(activeTicket.userID))}
                    </span>
                    <span>
                      <strong>{driverName(activeTicket.userID)}</strong>
                      <small>Ticket #{activeTicket.ticketID} · Parking Bay {activeTicket.bayNumber}</small>
                    </span>
                  </div>

                  <div className="thread-body">
                    <div className="bubble incoming">
                      <strong>Parking ticket issued</strong><br />
                      Parking Bay {activeTicket.bayNumber}<br />
                      {activeTicket.reason}<br />
                      Ticket ID: #{activeTicket.ticketID}
                    </div>
                    <div className="bubble incoming">{activeTicket.response}</div>
                  </div>

                  <div className="message-form">
                    <button className="button secondary" type="button" onClick={handleRejectResponse}>
                      Reject Response
                    </button>
                    <button className="button primary" type="button" onClick={handleMarkDone}>
                      Mark Ticket as Done
                    </button>
                  </div>
                </>
              ) : (
                <p role="status">Select a response to review.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TicketResponsesPage;

{/*References
 realCAiN. 2024. Updated* Dashboard for sales, ect / Admin Dashboard. (Version 2.0) [Source code] Available at: < https://codepen.io/realCaiN/pen/yLdEzwv > [Accessed 16 Aug. 2026]. 
 rudderz243.2026. rudderz243/insy7314-library.  (Version 2.0) [Source code]. Available at: <https://github.com/rudderz243/insy7314-library> [Accessed 17 Aug. 2026].
*/}