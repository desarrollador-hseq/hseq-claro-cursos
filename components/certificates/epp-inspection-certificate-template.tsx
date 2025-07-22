"use client";

import { formatDate, formatDateCert } from "@/lib/utils";
import {
  EppCertificationInspection,
  EppInspectionDetail,
} from "@prisma/client";
import {
  Document,
  Page,
  Text,
  StyleSheet,
  View,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "calibri",
  fonts: [
    {
      src: "/font/calibrii.ttf",
      fontStyle: "italic",
    },
    {
      src: "/font/calibri.ttf",
      fontWeight: 300,
    },
    {
      src: "/font/calibri.ttf",
      fontWeight: 400,
    },
    {
      src: "/font/calibrib.ttf",
      fontWeight: 500,
    },
    {
      src: "/font/calibrib.ttf",
      fontWeight: 600,
    },
    {
      src: "/font/calibrib.ttf",
      fontWeight: 700,
    },
  ],
});

interface EppInspectionCertificateProps {
  eppInspection:
    | (EppCertificationInspection & {
        inspectionDetails: EppInspectionDetail[];
      })
    | null;
}

export const EppInspectionCertificateTemplate = ({
  eppInspection,
}: EppInspectionCertificateProps) => {
  const inspectionDate = formatDate(eppInspection?.inspectionDate);
  const eppType = eppInspection?.eppType || "-";
  const eppName = eppInspection?.eppName || "-";
  const eppSerialNumber = eppInspection?.eppSerialNumber || "-";
  const eppBrand = eppInspection?.eppBrand || "-";
  const eppModel = eppInspection?.eppModel || "-";
  const manufacturingDate = formatDate(eppInspection?.manufacturingDate);
  const validationNotes = eppInspection?.validationNotes || "";
  const isSuitable = eppInspection?.isSuitable ? "SI" : "NO";

  const inspectionSummary = eppInspection?.inspectionSummary as any;
  const eppCategories = inspectionSummary?.categories || [];

  // Extraer las categorías y respuestas desde el formato [{"Categoria": "Respuesta"}]
  const categoryNames = eppCategories.map((cat: any) => Object.keys(cat)[0]);
  const categoryAnswers = eppCategories.map(
    (cat: any) => Object.values(cat)[0]
  );

  console.log({ eppCategories, eppInspection });

  return (
    <Document style={{ height: "100%", width: "100%" }}>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Main Container with Border */}
        <View style={styles.mainContainer}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            {/* Logo and Title */}
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <View style={styles.logoBox}>
                  <Text style={styles.logoText}>HSEQ</Text>
                </View>
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>HSEQ – CGIR S.A.S.</Text>
                <Text style={styles.subtitle}>
                  CONSULTORIA EN GESTION INTEGRAL DE RIESGOS
                </Text>
              </View>
            </View>
          </View>

          {/* Certificate Info Section */}
          <View style={styles.contentSection}>
            {/* Certificate Info Header */}
            <View style={styles.infoHeader}>
              <View style={styles.leftInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.boldText}>CERTIFICADO</Text>
                  <Text style={styles.normalText}>FOR-HSEQ-CGIR-155</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.boldText}>Denominación:</Text>
                  <Text style={styles.boldText}>
                    Inspección de equipos y elementos para trabajo seguro en
                    alturas
                  </Text>
                </View>
              </View>
              <View style={styles.rightInfo}>
                <Text style={styles.smallText}>Emisión: 08/11/2021</Text>
                <Text style={styles.smallText}>Versión: 01</Text>
                <Text style={styles.smallText}>Revisión:</Text>
                <View style={styles.certificateNumberBox}>
                  <Text style={styles.boldText}>CERTIFICADO No</Text>
                  <Text style={styles.certificateNumber}>
                    {eppInspection?.id}
                  </Text>
                </View>
              </View>
            </View>

            {/* Company and Inspector Info */}
            <View style={styles.companyInfo}>
              <View style={styles.infoGrid}>
                <View style={styles.gridLeft}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.boldText}>EMPRESA USUARIA:</Text>
                    <View style={styles.inputBox}>
                      <Text style={styles.boldCenterText}>
                        {eppInspection?.collaboratorName}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.boldText}>INSPECTOR ENCARGADO:</Text>
                    <View style={styles.inputBox}>
                      <Text style={styles.normalText}>
                        {eppInspection?.inspectorName}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.gridRight}>
                  <View style={styles.fieldRow}>
                    <Text style={styles.boldText}>FECHA DE INSPECCIÓN:</Text>
                    <View style={styles.inputBox}>
                      <Text style={styles.boldCenterText}>
                        {inspectionDate}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Element Description Table */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                1. DESCRIPCIÓN DEL ELEMENTO/EQUIPO
              </Text>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                  <View style={[styles.tableHeader, styles.column1]}>
                    <Text style={styles.tableHeaderText}>TIPO DE ELEMENTO</Text>
                  </View>
                  <View style={[styles.tableHeader, styles.column2]}>
                    <Text style={styles.tableHeaderText}>MARCA</Text>
                  </View>
                  <View style={[styles.tableHeader, styles.column2]}>
                    <Text style={styles.tableHeaderText}>LOTE</Text>
                  </View>
                  <View style={[styles.tableHeader, styles.column2]}>
                    <Text style={styles.tableHeaderText}>
                      REFERENCIA/SERIAL
                    </Text>
                  </View>
                  <View style={[styles.tableHeader, styles.column2]}>
                    <Text style={styles.tableHeaderText}>
                      FECHA MANUFACTURA
                    </Text>
                  </View>
                </View>
                {/* Table Content */}
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.column1]}>
                    <Text style={styles.tableCellBoldText}>{eppType}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.column2]}>
                    <Text style={styles.tableCellText}>{eppBrand}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.column2]}>
                    <Text style={styles.tableCellBoldText}>{eppModel}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.column2]}>
                    <Text style={styles.tableCellText}>{eppSerialNumber}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.column2]}>
                    <Text style={styles.tableCellText}>{manufacturingDate}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Component Verification */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                2. 2. VERIFICACIÓN DE LOS COMPONENTES DEL ELEMENTO/EQUIPO (B:
                Bueno, M: Malo)
              </Text>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                  {categoryNames?.map((category: string, index: number) => (
                    <View
                      key={index}
                      style={[styles.tableHeader, styles.column1]}
                    >
                      <Text style={styles.tableHeaderText}>{category}</Text>
                    </View>
                  ))}
                </View>
                {/* Table Content */}
                <View style={styles.tableRow}>
                  {categoryAnswers?.map((response: any, index: number) => (
                    <View
                      key={index}
                      style={[styles.tableCell, styles.column1]}
                    >
                      <Text style={styles.tableCellBoldText}>{response}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Improvement Aspect */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>3. ASPECTO POR MEJORAR</Text>
              <View style={styles.textBox}>
                <Text style={styles.normalText}>
                  {eppInspection?.observations}
                </Text>
              </View>
            </View>

            {/* Determination */}
            <View style={styles.sectionContainer}>
              <View style={styles.determinationRow}>
                <View style={styles.determinationLeft}>
                  <Text style={styles.sectionTitle}>4. DETERMINACIÓN</Text>
                  <View style={styles.determinationField}>
                    <Text style={styles.boldText}>CONTINUA EN SERVICIO:</Text>
                    <View style={styles.determinationBox}>
                      <Text style={styles.boldText}>{isSuitable}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Justification */}
            <View style={styles.sectionContainer}>
              <View style={styles.justificationBox}>
                <Text style={styles.boldText}>JUSTIFICACIÓN:</Text>
                <Text style={styles.normalText}>{validationNotes}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "calibri",
    backgroundColor: "#fff",
    padding: 15,
    fontSize: 10,
  },
  mainContainer: {
    border: "2px solid black",
    width: "100%",
    height: "100%",
  },
  headerSection: {
    borderBottom: "1px solid black",
    padding: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 50,
    height: 50,
    backgroundColor: "#f97316",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: {
    color: "white",
    fontWeight: 700,
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#dc2626",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#dc2626",
    textAlign: "center",
  },
  contentSection: {
    padding: 10,
    flex: 1,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  leftInfo: {
    flex: 1,
  },
  rightInfo: {
    alignItems: "flex-end",
  },
  infoRow: {
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 700,
    fontSize: 10,
  },
  normalText: {
    fontWeight: 400,
    fontSize: 10,
  },
  smallText: {
    fontSize: 9,
    marginBottom: 2,
  },
  certificateNumberBox: {
    border: "1px solid black",
    padding: 5,
    marginTop: 5,
    alignItems: "center",
    minWidth: 80,
  },
  certificateNumber: {
    textAlign: "center",
    fontWeight: 700,
    fontSize: 12,
  },
  companyInfo: {
    marginBottom: 10,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 10,
  },
  gridLeft: {
    flex: 1,
  },
  gridRight: {
    flex: 1,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  inputBox: {
    border: "1px solid black",
    padding: 3,
    marginLeft: 5,
    flex: 1,
    minHeight: 15,
    justifyContent: "center",
  },
  boldCenterText: {
    fontWeight: 700,
    textAlign: "center",
    fontSize: 10,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 700,
    marginBottom: 5,
    fontSize: 10,
  },
  table: {
    width: "100%",
    border: "1px solid black",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#e5e7eb",
    border: "1px solid black",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  tableCell: {
    border: "1px solid black",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  column1: {
    flex: 1.2,
  },
  column2: {
    flex: 1,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
  },
  tableCellText: {
    fontSize: 9,
    textAlign: "center",
  },
  tableCellBoldText: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
  },
  textBox: {
    border: "1px solid black",
    padding: 5,
    minHeight: 30,
  },
  determinationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  determinationLeft: {
    flex: 1,
  },
  determinationField: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  determinationBox: {
    border: "1px solid black",
    padding: 5,
    marginLeft: 10,
    minWidth: 30,
    alignItems: "center",
  },
  justificationBox: {
    border: "1px solid black",
    padding: 5,
  },
});
