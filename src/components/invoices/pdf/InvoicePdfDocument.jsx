import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 34,
    paddingHorizontal: 38,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  brandColumn: {
    flexGrow: 1,
    maxWidth: "58%",
  },

  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  logoText: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
  },

  businessName: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: "#020617",
  },

  mutedText: {
    marginTop: 4,
    color: "#64748b",
    lineHeight: 1.45,
  },

  invoiceColumn: {
    width: 190,
    alignItems: "flex-end",
  },

  invoiceLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  invoiceNumber: {
    marginTop: 5,
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: "#020617",
  },

  statusBadge: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#eff6ff",
  },

  statusText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#1d4ed8",
  },

  section: {
    marginTop: 20,
  },

  twoColumns: {
    flexDirection: "row",
    gap: 14,
  },

  infoCard: {
    flexGrow: 1,
    flexBasis: 0,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
  },

  sectionLabel: {
    marginBottom: 8,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  infoTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#020617",
  },

  infoLine: {
    marginTop: 4,
    color: "#475569",
    lineHeight: 1.4,
  },

  serviceBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8fafc",
  },

  serviceTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#020617",
  },

  table: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  tableRowLast: {
    flexDirection: "row",
  },

  cell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
  },

  headerCellText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
  },

  cellText: {
    fontSize: 8,
    color: "#334155",
  },

  cellTextBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },

  codeColumn: {
    width: "16%",
  },

  itemColumn: {
    width: "36%",
  },

  quantityColumn: {
    width: "12%",
    alignItems: "flex-end",
  },

  priceColumn: {
    width: "18%",
    alignItems: "flex-end",
  },

  totalColumn: {
    width: "18%",
    alignItems: "flex-end",
  },

  summaryWrapper: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  summary: {
    width: 230,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },

  summaryLabel: {
    color: "#64748b",
  },

  summaryValue: {
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },

  totalRow: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  totalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },

  totalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },

  noteBox: {
    marginTop: 18,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8fafc",
  },

  noteTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
  },

  noteText: {
    marginTop: 6,
    color: "#64748b",
    lineHeight: 1.5,
  },

  footer: {
    position: "absolute",
    left: 38,
    right: 38,
    bottom: 24,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

const statusLabels = {
  DRAFT: "Draft",
  UNPAID: "E papaguar",
  PAID: "E paguar",
  OVERDUE: "E vonuar",
};

function formatCurrency(value) {
  return `${new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0))} Leke`;
}

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${padNumber(date.getDate())}.${padNumber(
    date.getMonth() + 1,
  )}.${date.getFullYear()}`;
}

function getPartTotal(usage) {
  const storedTotal = Number(usage?.total || 0);

  if (storedTotal > 0) {
    return storedTotal;
  }

  return Number(usage?.quantity || 0) * Number(usage?.unitPrice || 0);
}

export default function InvoicePdfDocument({ invoice }) {
  const parts = invoice?.service?.partsUsed || [];

  const partsTotal = parts.reduce((sum, usage) => {
    return sum + getPartTotal(usage);
  }, 0);

  const serviceTotal = Number(invoice?.service?.total || 0);

  const laborTotal = invoice?.service
    ? Math.max(serviceTotal - partsTotal, 0)
    : 0;

  const invoiceTotal = Number(invoice?.total || 0);

  const businessAddress = [invoice?.business?.address, invoice?.business?.city]
    .filter(Boolean)
    .join(", ");

  const vehicleName = [invoice?.vehicle?.brand, invoice?.vehicle?.model]
    .filter(Boolean)
    .join(" ");

  const manualRows = invoice?.service
    ? []
    : [
        {
          id: "manual-invoice",
          code: "-",
          name: "Sherbim / Fature manuale",
          quantity: 1,
          unitPrice: invoiceTotal,
          total: invoiceTotal,
        },
      ];

  const rows =
    parts.length > 0
      ? parts.map((usage) => ({
          id: usage.id,
          code: usage.part?.code || "-",
          name: usage.part?.name || "Pjese",
          quantity: Number(usage.quantity || 0),
          unitPrice: Number(usage.unitPrice || 0),
          total: getPartTotal(usage),
        }))
      : manualRows;

  return (
    <Document
      title={`Fatura ${invoice?.number || ""}`}
      author={invoice?.business?.name || "AutoFlow"}
      subject="Fature sherbimi"
      creator="AutoFlow"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandColumn}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>AF</Text>
            </View>

            <Text style={styles.businessName}>
              {invoice?.business?.name || "AutoFlow"}
            </Text>

            {businessAddress ? (
              <Text style={styles.mutedText}>{businessAddress}</Text>
            ) : null}

            {invoice?.business?.phone ? (
              <Text style={styles.mutedText}>
                Tel: {invoice.business.phone}
              </Text>
            ) : null}

            {invoice?.business?.email ? (
              <Text style={styles.mutedText}>
                Email: {invoice.business.email}
              </Text>
            ) : null}
          </View>

          <View style={styles.invoiceColumn}>
            <Text style={styles.invoiceLabel}>Fature</Text>

            <Text style={styles.invoiceNumber}>{invoice?.number || "-"}</Text>

            <Text style={styles.mutedText}>
              Data: {formatDate(invoice?.createdAt)}
            </Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {statusLabels[invoice?.status] || "Draft"}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.twoColumns]}>
          <View style={styles.infoCard}>
            <Text style={styles.sectionLabel}>Klienti</Text>

            <Text style={styles.infoTitle}>
              {invoice?.customer?.name || "Pa klient"}
            </Text>

            {invoice?.customer?.phone ? (
              <Text style={styles.infoLine}>Tel: {invoice.customer.phone}</Text>
            ) : null}

            {invoice?.customer?.email ? (
              <Text style={styles.infoLine}>
                Email: {invoice.customer.email}
              </Text>
            ) : null}

            {invoice?.customer?.city ? (
              <Text style={styles.infoLine}>
                Qyteti: {invoice.customer.city}
              </Text>
            ) : null}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionLabel}>Automjeti</Text>

            <Text style={styles.infoTitle}>{vehicleName || "Pa automjet"}</Text>

            {invoice?.vehicle?.plate ? (
              <Text style={styles.infoLine}>
                Targa: {invoice.vehicle.plate}
              </Text>
            ) : null}

            {invoice?.vehicle?.year ? (
              <Text style={styles.infoLine}>Viti: {invoice.vehicle.year}</Text>
            ) : null}

            {invoice?.vehicle?.vin ? (
              <Text style={styles.infoLine}>VIN: {invoice.vehicle.vin}</Text>
            ) : null}
          </View>
        </View>

        {invoice?.service ? (
          <View style={styles.serviceBox}>
            <Text style={styles.sectionLabel}>Sherbimi</Text>

            <Text style={styles.serviceTitle}>
              {invoice.service.title || "Sherbim"}
            </Text>

            <Text style={styles.infoLine}>
              {invoice.service.description ||
                "Nuk eshte vendosur pershkrim per sherbimin."}
            </Text>
          </View>
        ) : null}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={[styles.cell, styles.codeColumn]}>
              <Text style={styles.headerCellText}>Kodi</Text>
            </View>

            <View style={[styles.cell, styles.itemColumn]}>
              <Text style={styles.headerCellText}>Pershkrimi</Text>
            </View>

            <View style={[styles.cell, styles.quantityColumn]}>
              <Text style={styles.headerCellText}>Sasia</Text>
            </View>

            <View style={[styles.cell, styles.priceColumn]}>
              <Text style={styles.headerCellText}>Cmimi</Text>
            </View>

            <View style={[styles.cell, styles.totalColumn]}>
              <Text style={styles.headerCellText}>Totali</Text>
            </View>
          </View>

          {rows.length > 0 ? (
            rows.map((row, index) => (
              <View
                key={row.id}
                wrap={false}
                style={
                  index === rows.length - 1
                    ? styles.tableRowLast
                    : styles.tableRow
                }
              >
                <View style={[styles.cell, styles.codeColumn]}>
                  <Text style={styles.cellText}>{row.code}</Text>
                </View>

                <View style={[styles.cell, styles.itemColumn]}>
                  <Text style={styles.cellTextBold}>{row.name}</Text>
                </View>

                <View style={[styles.cell, styles.quantityColumn]}>
                  <Text style={styles.cellText}>{row.quantity}</Text>
                </View>

                <View style={[styles.cell, styles.priceColumn]}>
                  <Text style={styles.cellText}>
                    {formatCurrency(row.unitPrice)}
                  </Text>
                </View>

                <View style={[styles.cell, styles.totalColumn]}>
                  <Text style={styles.cellTextBold}>
                    {formatCurrency(row.total)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRowLast}>
              <View style={[styles.cell, { width: "100%" }]}>
                <Text style={styles.cellText}>
                  Nuk ka pjese te regjistruara.
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.summaryWrapper} wrap={false}>
          <View style={styles.summary}>
            {invoice?.service ? (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Pjeset</Text>

                  <Text style={styles.summaryValue}>
                    {formatCurrency(partsTotal)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Puna</Text>

                  <Text style={styles.summaryValue}>
                    {formatCurrency(laborTotal)}
                  </Text>
                </View>
              </>
            ) : null}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total per pagese</Text>

              <Text style={styles.totalValue}>
                {formatCurrency(invoiceTotal)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.noteBox} wrap={false}>
          <Text style={styles.noteTitle}>Shenim</Text>

          <Text style={styles.noteText}>
            Faleminderit qe zgjodhet{" "}
            {invoice?.business?.name || "servisin tone"}. Ruajeni kete dokument
            si prove te sherbimit dhe pageses.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Gjeneruar nga AutoFlow</Text>

          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Faqja ${pageNumber} nga ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
