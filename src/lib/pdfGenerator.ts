import { jsPDF } from 'jspdf';
import {
  CertificateRecord,
  InstitutionSettings,
  PaymentRecord,
  PublishedResult,
  StudentRecord,
  TimetableSlot,
} from '../types/platform';

function addAcademyPdfHeader(
  doc: jsPDF,
  settings: InstitutionSettings,
  subtitle: string,
  navyMode = false
) {
  const width = doc.internal.pageSize.getWidth();
  if (navyMode) {
    // Premium Navy-Blue (#0B1F3A) & Royal Gold (#D9AD43) header for Marksheet
    doc.setFillColor(11, 31, 58);
    doc.rect(0, 0, width, 38, 'F');
    doc.setDrawColor(217, 173, 67);
    doc.setLineWidth(1.2);
    doc.rect(6, 6, width - 12, doc.internal.pageSize.getHeight() - 12);
    doc.setTextColor(217, 173, 67);
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.text(settings.name.toUpperCase(), width / 2, 16, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(248, 241, 223);
    doc.text(`${settings.tagline}  |  ${settings.location}`, width / 2, 23, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(217, 173, 67);
    doc.text(subtitle, width / 2, 31, { align: 'center' });
  } else {
    doc.setFillColor(6, 69, 44);
    doc.rect(0, 0, width, 34, 'F');
    doc.setDrawColor(217, 173, 67);
    doc.setLineWidth(0.9);
    doc.rect(6, 6, width - 12, doc.internal.pageSize.getHeight() - 12);
    doc.setTextColor(217, 173, 67);
    doc.setFont('times', 'bold');
    doc.setFontSize(19);
    doc.text(settings.name.toUpperCase(), width / 2, 15, { align: 'center' });
    doc.setFontSize(9.5);
    doc.setTextColor(248, 241, 223);
    doc.text(`${settings.tagline} · ${settings.boardName}`, width / 2, 22, { align: 'center' });
    doc.setTextColor(217, 173, 67);
    doc.text(subtitle, width / 2, 29, { align: 'center' });
  }
}

export function downloadMarksheetPdf(result: PublishedResult, settings: InstitutionSettings) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  addAcademyPdfHeader(doc, settings, `OFFICIAL EXAMINATION MARKSHEET · ${result.examTitle}`, true);

  doc.setTextColor(11, 31, 58);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  let y = 48;
  doc.text(`Student Name: ${result.studentName}`, 14, y);
  doc.text(`Roll Number: ${result.rollNumber}`, 120, y);
  y += 7;
  doc.text(`Father's Name: ${result.fatherName}`, 14, y);
  doc.text(`Admission No: ${result.admissionNumber}`, 120, y);
  y += 7;
  doc.text(`Class: ${result.classId}`, 14, y);
  doc.text(`Academic Session: ${result.sessionId}`, 120, y);
  y += 10;

  // Table header
  doc.setFillColor(11, 31, 58);
  doc.rect(14, y, width - 28, 9, 'F');
  doc.setTextColor(217, 173, 67);
  doc.setFont('helvetica', 'bold');
  doc.text('Subject', 17, y + 6);
  doc.text('Stream', 88, y + 6);
  doc.text('Full', 124, y + 6);
  doc.text('Pass', 146, y + 6);
  doc.text('Obtained', 168, y + 6);

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 30, 45);

  result.subjects.forEach((subj, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 244, 232);
      doc.rect(14, y, width - 28, 8, 'F');
    }
    doc.text(subj.subjectName.slice(0, 34), 17, y + 5.5);
    doc.text(subj.track === 'islamic' ? 'Islamic' : 'General', 88, y + 5.5);
    doc.text(String(subj.fullMarks), 124, y + 5.5);
    doc.text(String(subj.passMarks), 146, y + 5.5);
    doc.text(String(subj.obtainedMarks), 172, y + 5.5);
    y += 8;
  });

  y += 8;
  doc.setDrawColor(217, 173, 67);
  doc.line(14, y, width - 14, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 31, 58);
  doc.text(`Total Marks: ${result.totalMarks} / ${result.fullMarks}`, 14, y);
  doc.text(`Percentage: ${result.percentage.toFixed(2)}%`, 85, y);
  doc.text(`Grade: ${result.grade}`, 140, y);
  doc.text(`Status: ${result.resultStatus}`, 168, y);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Teacher Remarks: ${result.remarks || 'Consistent effort across General & Islamic subjects.'}`, 14, y);

  // Signature & Official Seal footer
  const sigY = 252;
  doc.setDrawColor(11, 31, 58);
  doc.circle(width / 2, sigY - 8, 13);
  doc.setFontSize(8);
  doc.text('OFFICIAL SEAL', width / 2, sigY - 7, { align: 'center' });

  doc.line(18, sigY, 72, sigY);
  doc.line(width - 72, sigY, width - 18, sigY);
  doc.setFontSize(9.5);
  doc.text('Controller of Examinations', 45, sigY + 5, { align: 'center' });
  doc.text(`Principal (${settings.principalName})`, width - 45, sigY + 5, { align: 'center' });

  doc.save(`Marksheet_${result.rollNumber}_${result.classId.replace(/\s+/g, '')}.pdf`);
}

export function downloadStudentIdCardPdf(student: StudentRecord, settings: InstitutionSettings) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [86, 54] });
  doc.setFillColor(6, 69, 44);
  doc.rect(0, 0, 86, 15, 'F');
  doc.setDrawColor(217, 173, 67);
  doc.setLineWidth(0.7);
  doc.rect(1.5, 1.5, 83, 51);
  doc.setTextColor(217, 173, 67);
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text(settings.name.toUpperCase(), 43, 7, { align: 'center' });
  doc.setTextColor(248, 241, 223);
  doc.setFontSize(6.5);
  doc.text('STUDENT IDENTITY CARD', 43, 12, { align: 'center' });

  doc.setTextColor(16, 45, 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(student.name, 7, 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Student ID: ${student.studentId}`, 7, 29);
  doc.text(`Class & Section: ${student.classId} (${student.sectionId || 'A'})`, 7, 34);
  doc.text(`Roll No: ${student.rollNumber}  |  Session: ${student.sessionId}`, 7, 39);
  doc.text(`Father: ${student.fatherName}`, 7, 44);
  doc.text(`Mode: ${student.learningMode}`, 7, 49);

  doc.save(`ID_Card_${student.studentId}.pdf`);
}

export function downloadCertificatePdf(
  cert: CertificateRecord,
  student: StudentRecord | undefined,
  settings: InstitutionSettings
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  addAcademyPdfHeader(doc, settings, cert.templateType.toUpperCase(), false);

  doc.setTextColor(16, 45, 35);
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.text(`Certificate No: ${cert.certificateNumber}`, 20, 48);
  doc.text(`Date of Issue: ${cert.issuedDate}`, width - 20, 48, { align: 'right' });

  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text(cert.templateType, width / 2, 70, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(13.5);
  const body =
    `This is to certify that ${cert.studentName}` +
    (student ? `, son/daughter of ${student.fatherName}, Admission No. ${student.admissionNumber},` : '') +
    ` is/was a bonafide scholar of ${settings.name} (${settings.location})` +
    (student ? ` enrolled in ${student.classId} (${student.sessionId}).` : '.') +
    ` This ${cert.templateType.toLowerCase()} is issued upon official verification from the Office of the Registrar.`;

  const lines = doc.splitTextToSize(body, width - 52);
  doc.text(lines, 26, 92);

  doc.setFontSize(11);
  doc.line(30, 170, 95, 170);
  doc.line(width - 95, 170, width - 30, 170);
  doc.text(`Issued By: ${cert.issuedBy}`, 62.5, 177, { align: 'center' });
  doc.text(`Principal (${settings.principalName})`, width - 62.5, 177, { align: 'center' });

  doc.save(`${cert.templateType.replace(/\s+/g, '_')}_${cert.certificateNumber}.pdf`);
}

export function downloadFeeReceiptPdf(payment: PaymentRecord, settings: InstitutionSettings) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
  addAcademyPdfHeader(doc, settings, 'OFFICIAL FEE PAYMENT RECEIPT', false);

  doc.setTextColor(16, 45, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  let y = 46;
  doc.text(`Receipt Number: ${payment.receiptNumber}`, 14, y);
  y += 7;
  doc.text(`Date: ${payment.paidAt}`, 14, y);
  y += 7;
  doc.text(`Student Name: ${payment.studentName}`, 14, y);
  y += 7;
  doc.text(`Student ID: ${payment.studentId}`, 14, y);
  y += 7;
  doc.text(`Invoice Ref: ${payment.invoiceId}`, 14, y);
  y += 7;
  doc.text(`Payment Method: ${payment.method}`, 14, y);
  y += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Amount Received: INR ${payment.amount.toLocaleString('en-IN')}`, 14, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Verification Status: ${payment.verified ? 'Verified' : 'Recorded'}`, 14, y);

  doc.save(`Fee_Receipt_${payment.receiptNumber}.pdf`);
}

export function downloadTimetablePdf(
  title: string,
  slots: TimetableSlot[],
  settings: InstitutionSettings
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  addAcademyPdfHeader(doc, settings, title.toUpperCase(), false);

  let y = 44;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setFillColor(16, 45, 35);
  doc.rect(12, y, width - 24, 8, 'F');
  doc.setTextColor(217, 173, 67);
  doc.text('Day', 15, y + 5.5);
  doc.text('Time', 52, y + 5.5);
  doc.text('Class', 94, y + 5.5);
  doc.text('Subject', 128, y + 5.5);
  doc.text('Teacher', 194, y + 5.5);
  doc.text('Room / Mode', 244, y + 5.5);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 45, 35);

  slots.slice(0, 18).forEach((slot, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 241, 223);
      doc.rect(12, y, width - 24, 7.5, 'F');
    }
    doc.text(slot.day, 15, y + 5);
    doc.text(`${slot.startTime} - ${slot.endTime}`, 52, y + 5);
    doc.text(`${slot.classId} (${slot.sectionId})`, 94, y + 5);
    doc.text(slot.subjectName.slice(0, 28), 128, y + 5);
    doc.text(slot.teacherName.slice(0, 22), 194, y + 5);
    doc.text(slot.roomOrMode.slice(0, 18), 244, y + 5);
    y += 7.5;
  });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

export function downloadCourseCompletionCertificatePdf(params: {
  studentName: string;
  studentId: string;
  classId: string;
  courseTitle: string;
  subjectName: string;
  certificateNumber: string;
  issuedAt: string;
  instructorName: string;
  settings: InstitutionSettings;
}) {
  const {
    studentName,
    studentId,
    classId,
    courseTitle,
    subjectName,
    certificateNumber,
    issuedAt,
    instructorName,
    settings,
  } = params;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  addAcademyPdfHeader(doc, settings, 'COURSE COMPLETION CERTIFICATE · ONLINE LMS', false);

  doc.setTextColor(16, 45, 35);
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.text(`Certificate ID: ${certificateNumber}`, 20, 48);
  doc.text(`Completed On: ${issuedAt.slice(0, 10)}`, width - 20, 48, { align: 'right' });

  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(6, 69, 44);
  doc.text('Certificate of Course Completion', width / 2, 70, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(16, 45, 35);
  doc.text('This is to proudly certify that', width / 2, 86, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(21);
  doc.text(studentName, width / 2, 99, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(13);
  const body =
    `(${studentId} · ${classId}) has successfully watched all required recorded lectures and ` +
    `passed every sequential lesson MCQ assessment in "${courseTitle}" (${subjectName}) ` +
    `offered by ${settings.name}.`;
  const lines = doc.splitTextToSize(body, width - 56);
  doc.text(lines, width / 2, 114, { align: 'center' });

  doc.setDrawColor(217, 173, 67);
  doc.circle(width / 2, 158, 12);
  doc.setFontSize(7.5);
  doc.text('VERIFIED LMS', width / 2, 159, { align: 'center' });

  doc.setFontSize(11);
  doc.setDrawColor(16, 45, 35);
  doc.line(26, 174, 96, 174);
  doc.line(width - 96, 174, width - 26, 174);
  doc.text(`Instructor: ${instructorName}`, 61, 181, { align: 'center' });
  doc.text(`Principal (${settings.principalName})`, width - 61, 181, { align: 'center' });

  doc.save(`LMS_Certificate_${certificateNumber}.pdf`);
}

export function exportCsvReport(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
