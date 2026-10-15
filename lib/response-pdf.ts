// Builds the "download my response" PDF. jsPDF is imported on demand so it only loads when someone downloads.
//
// jsPDF's built-in fonts only cover Latin text, so candidates are listed by their English names.

export type ResponseTier = { label: string; color: string; textColor: string; names: string[] };

export type Response = { maidName: string; fullName: string; tiers: ResponseTier[]; comments: string };

const PINK = "#D94296";
const MARGIN = 20;
const LINE_HEIGHT = 6;

export async function downloadResponsePdf(response: Response) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const textWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  // Starts a new page when the next block of the given height won't fit.
  const ensureSpace = (height: number) => {
    if (y + height <= pageHeight - MARGIN) return;
    doc.addPage();
    y = MARGIN;
  };

  const heading = (text: string) => {
    ensureSpace(LINE_HEIGHT * 2);
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(PINK);
    doc.text(text.toUpperCase(), MARGIN, y);
    y += LINE_HEIGHT;
  };

  // Body text, wrapped to the page width, or a grey "None" when empty.
  const body = (text: string, x = MARGIN, width = textWidth) => {
    doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(text ? "#000000" : "#a1a1aa");
    const lines: string[] = doc.splitTextToSize(text || "None", width);
    for (const line of lines) {
      ensureSpace(LINE_HEIGHT);
      doc.text(line, x, y);
      y += LINE_HEIGHT;
    }
  };

  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(PINK);
  doc.text("MAID CAFE POLL RESPONSE", MARGIN, y);
  y += LINE_HEIGHT * 2;

  heading("Maid Name");
  body(response.maidName);
  y += LINE_HEIGHT / 2;
  heading("Full Name");
  body(response.fullName);
  y += LINE_HEIGHT / 2;

  heading("Tier List");
  const badgeWidth = 18;
  const namesX = MARGIN + badgeWidth + 4;
  for (const tier of response.tiers) {
    ensureSpace(LINE_HEIGHT);
    doc.setFillColor(tier.color).roundedRect(MARGIN, y - 4, badgeWidth, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(tier.textColor);
    doc.text(tier.label, MARGIN + badgeWidth / 2, y, { align: "center" });
    body(tier.names.join(", "), namesX, pageWidth - MARGIN - namesX);
    y += 1;
  }
  y += LINE_HEIGHT / 2;

  heading("Additional Comments");
  body(response.comments);

  doc.save("maid-cafe-poll-response.pdf");
}
