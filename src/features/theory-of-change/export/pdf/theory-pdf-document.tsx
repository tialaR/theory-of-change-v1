import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { TheoryDocumentModel } from '@/features/theory-of-change/components/result-view/result-theory-narrative/theory-narrative.types';
import { formatTheoryExportMetadata } from '../model/theory-export-model';

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingRight: 48,
    paddingBottom: 56,
    paddingLeft: 56,
    fontSize: 11,
    fontFamily: 'Times-Roman',
    color: '#111111',
    lineHeight: 1.5
  },
  kicker: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    color: '#333333'
  },
  theoryName: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    marginBottom: 10,
    color: '#333333'
  },
  title: {
    fontSize: 16,
    fontFamily: 'Times-Bold',
    marginBottom: 8,
    lineHeight: 1.3
  },
  meta: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#555555',
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C8C8CC',
    borderBottomStyle: 'solid'
  },
  heading1: {
    fontSize: 14,
    fontFamily: 'Times-Bold',
    marginTop: 14,
    marginBottom: 8
  },
  heading2: {
    fontSize: 12,
    fontFamily: 'Times-Bold',
    marginTop: 12,
    marginBottom: 6
  },
  heading3: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    marginTop: 10,
    marginBottom: 4
  },
  paragraph: {
    fontSize: 11,
    marginBottom: 8,
    textAlign: 'justify'
  },
  callout: {
    marginTop: 8,
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#3A3A3E',
    borderLeftStyle: 'solid'
  },
  calloutLabel: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    marginBottom: 2
  },
  calloutText: {
    fontSize: 11
  },
  reference: {
    fontSize: 9,
    marginBottom: 8
  },
  footer: {
    position: 'absolute',
    left: 56,
    right: 48,
    bottom: 28,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#555555',
    textAlign: 'center'
  }
});

type TheoryPdfDocumentProps = {
  document: TheoryDocumentModel;
  theoryTitle: string;
};

function headingStyle(level: 1 | 2 | 3) {
  if (level === 1) {
    return styles.heading1;
  }
  if (level === 2) {
    return styles.heading2;
  }
  return styles.heading3;
}

export function TheoryPdfDocument({ document, theoryTitle }: TheoryPdfDocumentProps) {
  const resolvedTitle = theoryTitle.trim() || 'Teoria da mudança';

  return (
    <Document title={document.title} author="TDM" subject="Intérprete da Teoria">
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.kicker}>Intérprete da Teoria</Text>
        <Text style={styles.theoryName}>{resolvedTitle}</Text>
        <Text style={styles.title}>{document.title}</Text>
        <Text style={styles.meta}>{formatTheoryExportMetadata(document)}</Text>

        {document.executiveSummary.length > 0 ? (
          <View wrap>
            <Text style={styles.heading1}>Introdução</Text>
            {document.executiveSummary.map((paragraph) => (
              <Text key={paragraph.id} style={styles.paragraph}>
                {paragraph.text}
              </Text>
            ))}
          </View>
        ) : null}

        {document.pages.map((page) => {
          if (page.kind === 'references') {
            return (
              <View key={page.id} wrap>
                <Text style={styles.heading1}>Referências</Text>
                {document.references.map((reference) => (
                  <Text key={reference.id} style={styles.reference}>
                    {reference.text}
                  </Text>
                ))}
              </View>
            );
          }

          return (
            <View key={page.id} wrap>
              {page.sections.map((section) => (
                <View key={section.id} wrap>
                  {section.title ? (
                    <Text style={headingStyle(section.level)}>
                      {`${section.number ? `${section.number} ` : ''}${section.title}`}
                    </Text>
                  ) : null}
                  {(section.paragraphs ?? []).map((paragraph) => (
                    <Text key={paragraph.id} style={styles.paragraph}>
                      {paragraph.text}
                    </Text>
                  ))}
                  {(section.callouts ?? []).map((callout) => (
                    <View key={callout.id} style={styles.callout} wrap={false}>
                      <Text style={styles.calloutLabel}>{callout.label}</Text>
                      <Text style={styles.calloutText}>{callout.text}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          );
        })}

        <Text
          style={styles.footer}
          render={({ pageNumber }) => `${pageNumber}`}
          fixed
        />
      </Page>
    </Document>
  );
}
