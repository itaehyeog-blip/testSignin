document.addEventListener('DOMContentLoaded', () => {
    // Supabase 클라이언트 초기화
    const supabaseUrl = 'https://fuigsnzohqymmdgdbpeo.supabase.co';
    const supabaseKey = 'sb_publishable_uS8QQq7rVFNwwGdJoPvB4Q_scWeciHu';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    // 폼 및 입력 필드 요소 가져오기
    const signupForm = document.getElementById('signupForm');
    const userIdInput = document.getElementById('userId');
    const btnCheckId = document.getElementById('btnCheckId');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    
    // 이메일 관련 요소
    const emailUserInput = document.getElementById('emailUser');
    const emailDomainInput = document.getElementById('emailDomain');
    const emailDomainSelect = document.getElementById('emailDomainSelect');
    
    // 전화번호 관련 요소
    const phonePart1 = document.getElementById('phonePart1');
    const phonePart2 = document.getElementById('phonePart2');
    const phonePart3 = document.getElementById('phonePart3');
    
    // 약관동의 관련 요소
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    
    // 비밀번호 표시 토글 버튼들
    const btnTogglePasswords = document.querySelectorAll('.btn-toggle-password');

    // 에러 메시지 요소들
    const userIdMsg = document.getElementById('userIdMsg');
    const passwordMsg = document.getElementById('passwordMsg');
    const passwordConfirmMsg = document.getElementById('passwordConfirmMsg');
    const emailMsg = document.getElementById('emailMsg');
    const phoneMsg = document.getElementById('phoneMsg');
    const termsMsg = document.getElementById('termsMsg');

    // 상태 관리 변수
    let isIdChecked = false;
    let lastCheckedId = '';

    // Mock DB: 초기 중복 확인을 위한 등록된 아이디 목록
    const existingUsers = JSON.parse(localStorage.getItem('mockUsers')) || ['admin', 'yju1234', 'student01', 'computer2026'];
    localStorage.setItem('mockUsers', JSON.stringify(existingUsers));

    // 상세 회원 정보 목록 (로그인 검증용)
    const initialDetailedUsers = [
        { userId: 'admin', password: 'yju1234!', email: 'admin@yju.ac.kr', phone: '010-1111-2222' },
        { userId: 'yju1234', password: 'yju1234!', email: 'yju1234@yju.ac.kr', phone: '010-3333-4444' },
        { userId: 'student01', password: 'yju1234!', email: 'student01@g.yju.ac.kr', phone: '010-5555-6666' },
        { userId: 'computer2026', password: 'yju1234!', email: 'computer2026@g.yju.ac.kr', phone: '010-7777-8888' }
    ];
    let membersDetailed = JSON.parse(localStorage.getItem('membersDetailed'));
    if (!membersDetailed) {
        membersDetailed = initialDetailedUsers;
        localStorage.setItem('membersDetailed', JSON.stringify(membersDetailed));
    }

    // ==========================================
    // 1. 유효성 검사 헬퍼 함수
    // ==========================================
    
    // 메시지 표시 함수
    function showMessage(element, text, isSuccess = false) {
        element.textContent = text;
        if (isSuccess) {
            element.classList.remove('error');
            element.classList.add('success');
        } else {
            element.classList.remove('success');
            element.classList.add('error');
        }
    }

    // 메시지 초기화 함수
    function clearMessage(element) {
        element.textContent = '';
        element.classList.remove('error', 'success');
    }

    // 아이디 유효성 검사
    function validateUserId() {
        const value = userIdInput.value.trim();
        const idRegex = /^[a-z0-9]{4,20}$/;

        if (value === '') {
            showMessage(userIdMsg, '아이디를 입력해주세요.');
            return false;
        }
        if (!idRegex.test(value)) {
            showMessage(userIdMsg, '아이디는 4~20자의 영문 소문자와 숫자만 사용 가능합니다.');
            return false;
        }
        
        if (isIdChecked && value === lastCheckedId) {
            showMessage(userIdMsg, '사용 가능한 아이디입니다.', true);
            return true;
        } else {
            clearMessage(userIdMsg);
            isIdChecked = false; // 입력값이 바뀌었으므로 중복확인 취소
            return null; // 아직 중복확인이 필요하다는 표시
        }
    }

    // 비밀번호 유효성 검사
    function validatePassword() {
        const value = passwordInput.value;
        // 영문, 숫자, 특수문자 조합 8자 이상
        const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+|~\-={}\[\]:";'<>?,.\/]).{8,}$/;

        if (value === '') {
            showMessage(passwordMsg, '비밀번호를 입력해주세요.');
            return false;
        }
        if (!pwRegex.test(value)) {
            showMessage(passwordMsg, '비밀번호는 영문, 숫자, 특수문자를 혼용하여 8자 이상 입력해야 합니다.');
            return false;
        }
        showMessage(passwordMsg, '안전한 비밀번호입니다.', true);
        return true;
    }

    // 비밀번호 확인 일치 검사
    function validatePasswordConfirm() {
        const pwValue = passwordInput.value;
        const confirmValue = passwordConfirmInput.value;

        if (confirmValue === '') {
            showMessage(passwordConfirmMsg, '비밀번호 확인을 입력해주세요.');
            return false;
        }
        if (pwValue !== confirmValue) {
            showMessage(passwordConfirmMsg, '비밀번호가 일치하지 않습니다.');
            return false;
        }
        showMessage(passwordConfirmMsg, '비밀번호가 일치합니다.', true);
        return true;
    }

    // 이메일 유효성 검사
    function validateEmail() {
        const user = emailUserInput.value.trim();
        const domain = emailDomainInput.value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const fullEmail = `${user}@${domain}`;

        if (user === '' || domain === '') {
            showMessage(emailMsg, '이메일 주소를 완성해주세요.');
            return false;
        }
        if (!emailRegex.test(fullEmail)) {
            showMessage(emailMsg, '올바른 이메일 형식이 아닙니다.');
            return false;
        }
        clearMessage(emailMsg);
        return true;
    }

    // 전화번호 유효성 검사
    function validatePhone() {
        const p2 = phonePart2.value.trim();
        const p3 = phonePart3.value.trim();
        const numRegex = /^\d{3,4}$/;
        const numRegex4 = /^\d{4}$/;

        if (p2 === '' || p3 === '') {
            showMessage(phoneMsg, '전화번호를 입력해주세요.');
            return false;
        }
        if (!numRegex.test(p2) || !numRegex4.test(p3)) {
            showMessage(phoneMsg, '올바른 전화번호 형식(각 3~4자리 숫자)이어야 합니다.');
            return false;
        }
        clearMessage(phoneMsg);
        return true;
    }

    // 약관동의 검사
    function validateTerms() {
        if (!agreeTermsCheckbox.checked) {
            showMessage(termsMsg, '개인정보 수집 및 이용에 동의해야 가입이 가능합니다.');
            return false;
        }
        clearMessage(termsMsg);
        return true;
    }

    // ==========================================
    // 2. 이벤트 리스너 설정
    // ==========================================

    // 입력 필드 수정 시 실시간 유효성 체크
    userIdInput.addEventListener('input', () => {
        validateUserId();
    });

    passwordInput.addEventListener('input', () => {
        validatePassword();
        if (passwordConfirmInput.value !== '') {
            validatePasswordConfirm();
        }
    });

    passwordConfirmInput.addEventListener('input', () => {
        validatePasswordConfirm();
    });

    emailUserInput.addEventListener('input', () => {
        validateEmail();
    });

    emailDomainInput.addEventListener('input', () => {
        validateEmail();
    });

    phonePart2.addEventListener('input', (e) => {
        // 숫자만 입력 가능하게 제어
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        validatePhone();
    });

    phonePart3.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        validatePhone();
    });

    agreeTermsCheckbox.addEventListener('change', () => {
        validateTerms();
    });

    // 이메일 도메인 셀렉트 박스 변경 시
    emailDomainSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'direct') {
            emailDomainInput.value = '';
            emailDomainInput.removeAttribute('readonly');
            emailDomainInput.focus();
        } else {
            emailDomainInput.value = val;
            emailDomainInput.setAttribute('readonly', true);
        }
        validateEmail();
    });

    // 비밀번호 보이기/숨기기 토글
    btnTogglePasswords.forEach(button => {
        button.addEventListener('click', (e) => {
            // 버튼 내부의 입력 필드 찾기
            const wrapper = button.closest('.input-wrapper');
            const input = wrapper.querySelector('input');
            const icon = button.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });

    // 아이디 중복확인 버튼 클릭 시
    btnCheckId.addEventListener('click', async () => {
        const idVal = userIdInput.value.trim();
        const idRegex = /^[a-z0-9]{4,20}$/;

        if (idVal === '') {
            showMessage(userIdMsg, '아이디를 입력한 후 중복확인을 진행해주세요.');
            userIdInput.focus();
            return;
        }

        if (!idRegex.test(idVal)) {
            showMessage(userIdMsg, '아이디는 4~20자의 영문 소문자와 숫자만 사용 가능합니다.');
            userIdInput.focus();
            return;
        }

        try {
            showMessage(userIdMsg, '중복 확인 중...');
            
            const { data, error } = await supabaseClient
                .from('members')
                .select('user_id')
                .eq('user_id', idVal)
                .maybeSingle();

            if (error) {
                console.error('Supabase error:', error);
                showMessage(userIdMsg, '데이터베이스 조회 중 오류가 발생했습니다.');
                isIdChecked = false;
                return;
            }

            if (data) {
                showMessage(userIdMsg, '이미 사용 중이거나 탈퇴한 아이디입니다.');
                isIdChecked = false;
            } else {
                showMessage(userIdMsg, '사용 가능한 아이디입니다.', true);
                isIdChecked = true;
                lastCheckedId = idVal;
            }
        } catch (err) {
            console.error('Network error:', err);
            showMessage(userIdMsg, '서버 연결에 실패했습니다.');
            isIdChecked = false;
        }
    });

    // ==========================================
    // 3. 폼 제출 (회원가입 완료)
    // ==========================================
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지

        // 전체 유효성 수동 체크 실행
        const isIdValidResult = validateUserId();
        const isPwValid = validatePassword();
        const isPwConfirmValid = validatePasswordConfirm();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isTermsValid = validateTerms();

        // 1. 형식 유효성 통과 체크
        if (isIdValidResult === false || !isPwValid || !isPwConfirmValid || !isEmailValid || !isPhoneValid || !isTermsValid) {
            alert('입력 정보에 오류가 있습니다. 빨간색 안내 메시지를 확인해주세요.');
            return;
        }

        // 2. 아이디 중복확인 체크 여부 확인
        if (!isIdChecked || userIdInput.value.trim() !== lastCheckedId) {
            showMessage(userIdMsg, '아이디 중복확인을 반드시 완료해주셔야 합니다.');
            userIdInput.focus();
            return;
        }

        // 모든 조건 만족 시 가입 진행
        const finalId = userIdInput.value.trim();
        const finalPassword = passwordInput.value;
        const finalEmail = `${emailUserInput.value.trim()}@${emailDomainInput.value.trim()}`;
        const finalPhone = `${phonePart1.value}-${phonePart2.value.trim()}-${phonePart3.value.trim()}`;

        try {
            const submitBtn = document.getElementById('btnSubmit');
            if (submitBtn) submitBtn.disabled = true;

            const { error } = await supabaseClient
                .from('members')
                .insert([
                    {
                        user_id: finalId,
                        password: finalPassword,
                        email: finalEmail,
                        phone: finalPhone
                    }
                ]);

            if (error) {
                console.error('Supabase Insert Error:', error);
                if (error.code === '23505') {
                    if (error.message.includes('email')) {
                        alert('이미 등록된 이메일 주소입니다.');
                    } else {
                        alert('이미 사용 중인 정보가 포함되어 있습니다.');
                    }
                } else {
                    alert(`회원가입 중 데이터베이스 오류가 발생했습니다: ${error.message}`);
                }
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            // 세션 스토리지에 가입 정보 임시 저장 (결과 페이지 노출용)
            sessionStorage.setItem('latestSignup', JSON.stringify({
                userId: finalId,
                email: finalEmail,
                phone: finalPhone
            }));

            // 가입 성공 알림 후 welcome.html로 리다이렉션
            alert(`🎉 영진전문대학교 회원가입이 완료되었습니다!\n확인을 누르면 환영 페이지로 이동합니다.`);
            window.location.href = `welcome.html?userId=${encodeURIComponent(finalId)}`;
        } catch (err) {
            console.error('Runtime error:', err);
            alert('서버 연결 실패 또는 네트워크 오류가 발생했습니다.');
            const submitBtn = document.getElementById('btnSubmit');
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});
