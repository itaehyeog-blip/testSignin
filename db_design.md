# 영진전문대학교 회원가입 시스템 데이터베이스 설계서

본 문서는 영진전문대학교 회원가입 페이지에서 입력받는 사용자 정보를 저장하기 위한 데이터베이스(DB) 설계서입니다.

---

## 1. 테이블 정의 (Table Definition)

### 테이블명: `members` (회원 테이블)
시스템에 가입한 사용자(학생 및 교직원 등)의 계정 정보를 저장하는 테이블입니다.

| 순번 | 컬럼명 (Logical) | 컬럼명 (Physical) | 데이터 타입 (Data Type) | 제약 조건 (Constraints) | 설명 (Description) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 일련번호 | `number` | `INT` | PRIMARY KEY, AUTO_INCREMENT | 고유 식별 번호 (자동 증가) |
| 2 | 아이디 | `user_id` | `VARCHAR(20)` | UNIQUE, NOT NULL | 로그인용 사용자 아이디 (중복 불가) |
| 3 | 비밀번호 | `password` | `VARCHAR(255)` | NOT NULL | 단방향 해시(예: SHA-256/bcrypt) 암호화된 비밀번호 |
| 4 | 이메일 | `email` | `VARCHAR(100)` | UNIQUE, NOT NULL | 연락 및 인증용 이메일 주소 |
| 5 | 전화번호 | `phone` | `VARCHAR(15)` | NOT NULL | 연락처 (예: 010-XXXX-XXXX) |

---

## 2. 컬럼 상세 설명 및 제약 조건

1. **`number` (일련번호)**
   - 데이터가 추가될 때마다 자동으로 1씩 증가하는 기본키(Primary Key)입니다.
   - 인덱싱의 기준이 되며 물리적으로 테이블 내의 데이터를 고유하게 식별합니다.

2. **`user_id` (아이디)**
   - 최소 4자 이상, 최대 20자 이하의 영문 소문자와 숫자 조합으로 제한을 권장합니다.
   - 중복된 아이디 가입을 방지하기 위해 `UNIQUE` 제약 조건을 설정합니다.

3. **`password` (비밀번호)**
   - 보안을 위해 일반 텍스트가 아닌 암호화 알고리즘(예: bcrypt, Argon2)을 거친 해시값으로 저장해야 하므로 데이터 길이를 넉넉히 `VARCHAR(255)`로 설정합니다.

4. **`email` (이메일)**
   - 이메일 형식을 준수해야 하며, 비밀번호 찾기나 인증 메일 발송 등에 사용됩니다.
   - 1인 1계정 원칙을 위해 `UNIQUE` 처리를 합니다.

5. **`phone` (전화번호)**
   - 대시(`-`)를 포함하거나 포함하지 않는 문자열 형태를 저장합니다.
   - 예: `010-1234-5678` 또는 `01012345678`

---

## 3. SQL DDL (테이블 생성 쿼리 예시)

데이터베이스 구축 시 아래의 SQL 문을 실행하여 테이블을 생성할 수 있습니다. (MySQL/MariaDB 기준)

```sql
CREATE TABLE `members` (
    `number` INT AUTO_INCREMENT COMMENT '일련번호' PRIMARY KEY,
    `user_id` VARCHAR(20) NOT NULL COMMENT '아이디' UNIQUE,
    `password` VARCHAR(255) NOT NULL COMMENT '비밀번호',
    `email` VARCHAR(100) NOT NULL COMMENT '이메일' UNIQUE,
    `phone` VARCHAR(15) NOT NULL COMMENT '전화번호',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '가입일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영진전문대학교 회원 정보 테이블';
```
