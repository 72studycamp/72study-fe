// src/app/others/parcel/_utils/cafeExport.ts
import { ParcelRow } from './parcelTypes';

export function normalizeGender(g?: string) {
  if (!g) return '';
  const v = String(g).trim();
  if (v === '여' || v === 'F' || v.toLowerCase() === 'female') return '여';
  if (v === '남' || v === 'M' || v.toLowerCase() === 'male') return '남';
  return v;
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// ✅ 원하는 학년 순서: 중3 → 고1 → 고2 → 고3
function gradeRank(grade?: string) {
  const g = (grade ?? '').replace(/\s/g, '');
  if (g === '중3' || g === '예비고1') return 1;
  if (g === '고1' || g === '예비고2') return 2;
  if (g === '고2' || g === '예비고3') return 3;
  if (g === '고3') return 4;
  return 99; // 기타는 뒤로
}

function teamRank(teamNo?: string) {
  // "2조" 같은 값에서 숫자만 뽑아서 정렬
  const m = String(teamNo ?? '').match(/\d+/);
  return m ? Number(m[0]) : 99;
}

function sortForCafe(list: ParcelRow[]) {
  return [...list].sort((a, b) => {
    // 1) 학년
    const gr = gradeRank(a.grade) - gradeRank(b.grade);
    if (gr !== 0) return gr;

    // 2) 조
    const tr = teamRank(a.teamNo) - teamRank(b.teamNo);
    if (tr !== 0) return tr;

    // 3) 이름
    return (a.studentName ?? '').localeCompare(b.studentName ?? '', 'ko');
  });
}

type CafeCopyPayload = { plain: string; html: string };

// ✅ 방호수 컬럼 제거 (표/텍스트 둘 다)
function buildTableRows(list: ParcelRow[]) {
  // 번호/이름/성별/조/학년/개수/강의실  (방호수 없음)
  const header = `
    <tr>
      <th>구분</th><th>성명</th><th>성별</th><th>조</th><th>학년</th><th>개수</th><th>강의실</th>
    </tr>
  `;

  const body = list
    .map((r, i) => {
      const team = escapeHtml(r.teamNo ?? '');
      const grade = escapeHtml(r.grade ?? '');
      const gender = escapeHtml(normalizeGender(r.gender) || '');
      const name = escapeHtml(r.studentName ?? '');
      const qty = escapeHtml(String(r.quantity ?? 1));
      const hall = escapeHtml(r.lectureHall ?? '');
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${name}</td>
          <td>${gender}</td>
          <td>${team}</td>
          <td>${grade}</td>
          <td>${qty}</td>
          <td>${hall}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <table border="1" style="border-collapse:collapse; width:100%;">
      <tbody>
        ${header}
        ${body || `<tr><td colspan="7">(없음)</td></tr>`}
      </tbody>
    </table>
  `;
}

export function buildCafeCopyPayload(date: string, rows: ParcelRow[]): CafeCopyPayload {
  const girls = sortForCafe(rows.filter((r) => normalizeGender(r.gender) === '여'));
  const boys = sortForCafe(rows.filter((r) => normalizeGender(r.gender) === '남'));

  // plain (fallback): 방호수 없이 TSV
  const toTsv = (list: ParcelRow[]) =>
    list.length === 0
      ? '(없음)'
      : list
          .map((r, i) => {
            const team = r.teamNo ?? '';
            const grade = r.grade ?? '';
            const gender = normalizeGender(r.gender) ?? '';
            const hall = r.lectureHall ?? '';
            return [i + 1, r.studentName, gender, team, grade, r.quantity, hall].join('\t');
          })
          .join('\n');

  const plain = [
    `[강화] ${date} 택배 현황`,
    '',
    '<여학생 교재 택배>',
    toTsv(girls),
    '',
    '<남학생 교재 택배>',
    toTsv(boys),
  ].join('\n');

  // html: 표 (방호수 없음)
  const html = `
    <div>
      <p><b>[강화] ${escapeHtml(date)} 택배 현황</b></p>

      <p><b>&lt;여학생 교재 택배&gt;</b></p>
      ${buildTableRows(girls)}

      <br/>

      <p><b>&lt;남학생 교재 택배&gt;</b></p>
      ${buildTableRows(boys)}
    </div>
  `.trim();

  return { plain, html };
}