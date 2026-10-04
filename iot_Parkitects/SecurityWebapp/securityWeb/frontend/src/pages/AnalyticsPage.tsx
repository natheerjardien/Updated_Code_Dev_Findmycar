//(rudderz243,2026)
import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";

interface ParkingHistory {
  bay: string;
  user: string;
  userType: string;
  timeIn: string;
  timeOut: string;
  duration: string;
  status: string;
}



export const AnalyticsPage: React.FC = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // state to hold the dynamic data
  const [rows, setRows] = useState<ParkingHistory[]>([]);
  const [summary, setSummary] = useState({ issued: 0, resolved: 0, avgTime: 0, 
    weeklyChart: [0, 0, 0, 0, 0, 0, 0], // Set the default chart values to 0
    breakdown: { RP: 0, VB: 0, IB: 0, OT: 0 }  // Set the default violation report values to 0
  });

  const[isLoading, setIsLoading] = useState(true);

  // Function to extract the fetch logic 
  const fetchAnalyticsData = async (isPolling = false) => {

    if(!isPolling) {
      setIsLoading(true);
    }

    try {
      const historyResponse = await fetch("http://localhost:8080/api/Analytics/history");
      const historyData = await historyResponse.json();
      setRows(historyData);

      const summaryResponse = await fetch("http://localhost:8080/api/Analytics/summary");
      const summaryData = await summaryResponse.json();
      setSummary({
          issued: summaryData.ticketsIssued,
          resolved: summaryData.ticketsResolved,
          avgTime: summaryData.avgResolutionTimeHours.toFixed(1),
          weeklyChart: summaryData.weeklyChart,
          breakdown: summaryData.violationBreakdown
      });
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setIsLoading(false); // Stop loading whether it succeeds or fails
    }
  };
  

  // (Meta Platforms, Inc., 2026)
  useEffect(() => {
    fetchAnalyticsData();

    // Set up the polling interval every 30 seconds
    const intervalId = setInterval(() => {
      fetchAnalyticsData(true); // Pass true to indicate this is a background poll
    }, 30000);

    // Cleanup function runs when the component unmounts to stop the interval
    return () => {
      clearInterval(intervalId);
    };

  }, []);

  const handleChangePage = (
    _event: unknown,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <section
      className="page is-active"
      aria-labelledby="analyticsTitle"
    >

      {/* PAGE HEADING */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Parking intelligence
          </p>

          <h1 id="analyticsTitle">
            Analytics
          </h1>

          <p>
            Monitor parking activity, violations, and historical
            parking records across campus.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Button to refresh the data */}
          <button 
            className="button secondary" 
            type="button" 
            onClick={() => fetchAnalyticsData()}
          >
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </button>

          <button
            className="button primary"
            type="button"
          >
            Download Report
          </button>
        </div>
      </div>


      {/* INSIGHT CARDS */}
      <div className="insight-strip">
        <article className="searchable" data-search="tickets issued parking violations">
          <span>Tickets issued</span>
          <strong>{summary.issued}</strong> 
        </article>

        <article className="searchable" data-search="tickets resolved completed">
          <span>Tickets resolved</span>
          <strong>{summary.resolved}</strong> 
        </article>

        <article className="searchable" data-search="ticket resolution time">
          <span>Avg. resolution time</span>
          <strong>{summary.avgTime} hrs</strong> 
        </article>
      </div>


      {/* ANALYTICS SECTION */}
      <div className="analytics-layout">

        {/* TICKET CHART */}
        <article
          className="panel searchable"
          data-search="parking violations tickets issued days"
        >
          <div className="panel-heading">

            <div>
              <p className="panel-kicker">
                Violations
              </p>

              <h2>
                Parking tickets
              </h2>
            </div>

            <span className="status success">
              This week
            </span>

          </div>


          <div className="bar-chart" aria-label="Parking tickets issued throughout the week">
            {/* Maps the calculated height percentages to the bar styles dynamically */}
            <span style={{ height: `${summary.weeklyChart[0]}%` }}><i>Mon</i></span>
            <span style={{ height: `${summary.weeklyChart[1]}%` }}><i>Tue</i></span>
            <span style={{ height: `${summary.weeklyChart[2]}%` }}><i>Wed</i></span>
            <span style={{ height: `${summary.weeklyChart[3]}%` }}><i>Thu</i></span>
            <span style={{ height: `${summary.weeklyChart[4]}%` }}><i>Fri</i></span>
            <span style={{ height: `${summary.weeklyChart[5]}%` }}><i>Sat</i></span>
            <span style={{ height: `${summary.weeklyChart[6]}%` }}><i>Sun</i></span>
          </div>
        </article>


        {/* VIOLATION BREAKDOWN */}
        <article
          className="panel searchable"
          data-search="violation breakdown restricted parking overstayed incorrect bay"
        >

          <div className="panel-heading">

            <div>
              <p className="panel-kicker">
                Violation types
              </p>

              <h2>
                Violation breakdown
              </h2>
            </div>

          </div>


          <div className="region-list">
            <div>
              <span><i>RP</i>Restricted parking</span>
              <strong>{summary.breakdown.RP}%</strong>
            </div>

            <div>
              <span><i>VB</i>Vehicle outside bay</span>
              <strong>{summary.breakdown.VB}%</strong>
            </div>

            <div>
              <span><i>IB</i>Incorrect bay</span>
              <strong>{summary.breakdown.IB}%</strong>
            </div>

            <div>
              <span><i>OT</i>Other</span>
              <strong>{summary.breakdown.OT}%</strong>
            </div>
          </div>

        </article>

      </div>


      {/* PARKING HISTORY */}
      <div className="parking-history panel">

        <div className="panel-heading">

          <div>
            <p className="panel-kicker">
              Historical records
            </p>

            <h2>
              Parking History
            </h2>
          </div>

          <button
            className="text-button"
            type="button"
          >
            View all
          </button>

        </div>


        {/* parking data table (Material UI,2026) */}
        <Paper
          sx={{
            width: "100%",
            overflow: "hidden",
            boxShadow: "none",
            background: "transparent",
          }}
        >

          <TableContainer
            sx={{
              maxHeight: 440,
            }}
          >

            <Table
              stickyHeader
              aria-label="parking history table"
            >

              <TableHead>

                <TableRow>

                  <TableCell>
                    Parking Bay
                  </TableCell>

                  <TableCell>
                    User
                  </TableCell>

                  <TableCell>
                    User Type
                  </TableCell>

                  <TableCell>
                    Time In
                  </TableCell>

                  <TableCell>
                    Time Out
                  </TableCell>

                  <TableCell>
                    Duration
                  </TableCell>

                  <TableCell>
                    Status
                  </TableCell>

                </TableRow>

              </TableHead>


              <TableBody>

                {rows
                  .slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                  .map((row) => (

                    <TableRow
                      hover
                      key={`${row.bay}-${row.user}-${row.timeIn}`}
                    >

                      <TableCell>
                        <strong>
                          {row.bay}
                        </strong>
                      </TableCell>

                      <TableCell>
                        {row.user}
                      </TableCell>

                      <TableCell>
                        {row.userType}
                      </TableCell>

                      <TableCell>
                        {row.timeIn}
                      </TableCell>

                      <TableCell>
                        {row.timeOut}
                      </TableCell>

                      <TableCell>
                        {row.duration}
                      </TableCell>

                      <TableCell>
                        <span
                          className={
                            row.status === "Parked"
                              ? "status pending"
                              : "status success"
                          }
                        >
                          {row.status}
                        </span>
                      </TableCell>

                    </TableRow>

                  ))}

              </TableBody>

            </Table>

          </TableContainer>


          <TablePagination
            rowsPerPageOptions={[
              10,
              25,
              100,
            ]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={
              handleChangeRowsPerPage
            }
          />

        </Paper>

      </div>

    </section>
  );
};

export default AnalyticsPage;

{/*References
    Material UI.2026. Table. (Version 2.0) [Source code] . Available at: <https://mui.com/material-ui/react-table/> [Accessed 12 August 2026]. 
    Meta Platforms, Inc. 2026. Synchronizing with Effects – React. [Online] Available at: <https://react.dev/learn/synchronizing-with-effects> [Accessed 2 October 2026].
    realCAiN. 2024. Updated* Dashboard for sales, ect / Admin Dashboard. (Version 2.0) [Source code] Available at: < https://codepen.io/realCaiN/pen/yLdEzwv > [Accessed 16 August 2026].        
    rudderz243.2026. rudderz243/insy7314-library.  (Version 2.0) [Source code]. Available at: <https://github.com/rudderz243/insy7314-library> [Accessed 17 August 2026].
*/}