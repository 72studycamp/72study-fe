// 백엔드 API 응답을 프론트엔드 Student 타입으로 변환
import { ApiStudent, Student } from '@/types/student';

export function mapApiStudentToStudent(apiStudent: ApiStudent): Student {
  // teamNo를 "조" 형식으로 변환 (예: "1" -> "1조")
  const group = apiStudent.teamNo ? `${apiStudent.teamNo}조` : undefined;
  
  // roomNo를 "방호조" 형식으로 변환 (예: "501" -> "501호")
  const roomGroup = apiStudent.roomNo 
    ? `${apiStudent.roomNo}호 ${apiStudent.teamNo || ''}`.trim()
    : '';

  // birthDate를 "나이" 형식으로 변환 (예: "2010-01-01" -> "2010년생")
  const age = apiStudent.birthDate
    ? `${apiStudent.birthDate.split('-')[0]}년생`
    : '';

  // 강의장 매핑 (roomNo 기반으로 추정, 실제 로직은 백엔드에 맞게 조정 필요)
  const lectureHall = apiStudent.roomNo
    ? getLectureHallFromRoom(apiStudent.roomNo)
    : undefined;

  return {
    id: apiStudent.id,
    name: apiStudent.studentName,
    fullName: apiStudent.studentName,
    gender: apiStudent.gender,
    age,
    course: apiStudent.course,
    grade: apiStudent.grade,
    school: apiStudent.school || '',
    mentor: apiStudent.mentorName || '',
    roomGroup,
    email: apiStudent.email,
    applicationProcess: apiStudent.campus || '',
    lectureHall,
    group,
    absences: [], // 외출/외박은 별도 API로 관리한다고 가정
  };
}

// 방 번호로 강의장 추정 (실제 로직은 백엔드 데이터에 맞게 조정 필요)
function getLectureHallFromRoom(roomNo: string): string | undefined {
  const roomNum = parseInt(roomNo);
  if (roomNum >= 500 && roomNum < 600) return '1강의장';
  if (roomNum >= 600 && roomNum < 700) return '2강의장';
  if (roomNum >= 700 && roomNum < 800) return '5강의장';
  if (roomNum >= 800) return '6강의장';
  return undefined;
}

