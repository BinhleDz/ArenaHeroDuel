// thongtin.js
const HeroData = {
    'cheese': {
        difficulty: 1,
        passive: `Đánh thường: Đạn phô mai | Sát thương: 7\nTỉ lệ 4,9% đòn đánh thườn ném ra 1 miếng bơ\n \nNội tại: Đạn bơ | Sát thương 10\nLàm choáng địch 1,5s`,
        c1: ` Phô mai cuộn | Sát thương: 25 \nKhi Phô mai cuộn trúng địch sẽ tạo ra 5 miếng bơ trong phạm vi ngắn có tác dụng bẫy, địch giẵm vào sẽ bị choáng 1s`,
        c2: ` Bơ trơn trượt | Sát thương: 30 \nTạo ra 1 đường trơn trượt khiến địch giảm tốc chạy và không thể nhảy`,
        c3: ` Mưa bơ | Sát thương: 15 \nTạo ra cơn mưa bơ trên toàn map nếu trúng địch sẽ gây choáng 3s`
    },
    'robot-R1': {
        difficulty: 3,
        passive: `Nội tại: X \nĐánh thường: X | Sát thương: 7`,
        c1: ` Điện cầu | Sát thương: 25 \nGây liên tiếp 1 sát thương giật điện trong phạm vi điện cầu`,
        c2: ` khiên năng lượng \nTạo 3 lớp lá chắn chặn nhiều loại đòn đánh và lượng nhỏ máu ảo`,
        c3: ` Hỏa cầu | Sát thương: 80 \nBắn hỏa cầu gây sát thương và choáng, nếu hụt trúng chướng ngại vật có thể gây nổ lớn lên cả bản thân và địch `
    },
    'gojo': {
        difficulty: 3,
        passive: `Nội tại: X \nĐánh thường: X | Sát thương: 7`,
        c1: ` Blue | Sát thương: 15 \nHút địch lại sau đó phát nổ`,
        c2: ` Red | Sát thương: 30 \nBắn red gây sát thương và choáng`,
        c3: ` Purple | Sát thương: 125 \nBắn purple gây lượng lớn sát thương `
    },
    'law': {
        difficulty: 4,
        passive: `Nội tại: \nMọi đòn đánh đều phụ thuộc vào ROOM\nAmputate: \nĐòn đánh thường trong ROOM 100% hit và heal 2hp\nSát thương : 12`,
        c1: ` ROOM \nTạo vùng không gian .`,
        c2: ` Shambles \nHoán đổi vị trí với kẻ địch.`,
        c3: ` Gamma Knife | Sát thương: 75 \nLướt tới và đâm vào địch.`
    },
    'greninja': {
        difficulty: 1,
        passive: `Nội tại: Ninja nước\n-Triple jump\n-Tăng tốc chạy và hồi dash\nĐánh thường: phi tiêu nước | Sát thương : 7.`,
        c1: ` Liên hoàn phi tiêu nước | Sát thương : 6\nPhi liên tiếp 5 đợt phi tiêu lên địch`,
        c2: ` Lưỡi cắt phi tiêu | Sát thương : 6\nCắt liên tiếp lên địch nếu bị tiếp cận `,
        c3: ` Đại phi tiêu nước | Sát thương : 30-25 \nCắt 2 đợt phi tiêu lớn gây sát thương lần lượt 30->25 dame`
    },
    'steve': {
        difficulty: 4,
        passive: `Nội tại: Kích hoạt totem khi bị hạ lần đầu.\nĐánh thường: Bắn cung | Sát thương : 10\nBắn cung tỉ lệ 50% ra các mũi tên hiệu ứng\n-Sát thương tức thì\n-Độc\n-Lửa\n-Chậm\n-Bay lên .`,
        c1: `Kiếm kim cương | Sát thương :20\nChém 3 nhát kiếm phía trước mặt`,
        c2: `Giáo kim cương | Sát thương :15\nLướt giáo một đoạn và gây sát thương`,
        c3: `Elytra Mace | Sát thương :tăng theo độ cao\nSử dụng khi ở trên không bản thân rơi nhanh xuống gây lượng lớn sát thương`
    },
    'steve': {
        difficulty: 4,
        passive: `Nội tại: Kích hoạt totem khi bị hạ lần đầu.\nĐánh thường: Bắn cung | Sát thương : 10\nBắn cung tỉ lệ 50% ra các mũi tên hiệu ứng\n-Sát thương tức thì\n-Độc\n-Lửa\n-Chậm\n-Bay lên .`,
        c1: `Kiếm kim cương | Sát thương :20\nChém 3 nhát kiếm phía trước mặt`,
        c2: `Giáo kim cương | Sát thương :15\nLướt giáo một đoạn và gây sát thương`,
        c3: `Elytra Mace | Sát thương :tăng theo độ cao\nSử dụng khi ở trên không bản thân rơi nhanh xuống gây lượng lớn sát thương`
    },
    'alex': {
        difficulty: 2,
        passive: `Đánh thường: Đâm Trident | Sát thương :9`,
        c1: `Lòng trung thành | Sát thương :21\nPhóng trident về phía trước gây dame và quay ngược lại gây dame`,
        c2: `Ender Pearl Trident | Sát thương :20\nPhóng trident có gắn ender pearl, trúng địch gây sát thương và dịch chuyển ra vị trí địch, đồng thời cường hóa sát thương`,
        c3: `Chớp điện | Sát thương :40\nPhóng triden trúng địch tạo sấm sét gây lượng lớn sát thương và đốt máu phạm vi`
    },
    'ronaldo': {
        difficulty: 1,
        passive: `Đánh thường: Sút bóng | Sát thương :35\nSát thương sẽ giảm dần khi càng ra xa`,
        c1: `Chân sút bóng đêm | Sát thương :50\nSát thương sẽ giảm 50% khi bóng chạm đất`,
        c2: `Chân sút hỏa thiêu | Sát thương :20\nSút 1 quả bóng lửa đuổi theo địch\n\tCẩn thận !`,
        c3: `Siuuuuu | Sát thương :?\nSút ngược mọi đòn đánh của đối thủ\n\tCó thể lấy luôn cả phòng thủ của địch (tính năng)`
    },
    'sans': {
        difficulty: 2,
        passive: `Đánh thường: Sương | Sát thương :5\nCó thể xuyên nhiều mục tiêu`,
        c1: `Tường xương | Sát thương :25\nTạo 1 bức tường xương dài gây dame\n\tCẩn thận va chạm quá nhiều`,
        c2: `Tay khóa | Thời gian :3s\nTạo 1 bàn tay trong 0,25s sẽ khóa địch lại không thể rời khỏi`,
        c3: `Lazer | Sát thương :25\nTriệu hồi 4 đầu rồng xương ở 4 góc và 1 đầu trước mặt sau đó bắn 5 tia lazer`
    },
    'decade': {
        difficulty: 5,
        passive: `Đánh thường: Gunform | Sát thương :10\n \nNội tại: Kẻ hủy diệt\nGây 10 lần sát thương lên địch khiến địch choáng trong 1 khoảng thời gian ngắn`,
        c1: `Blast | Sát thương :8\nDecade dơ tay nhanh tạo ảo ảnh 5 khẩu súng bắn 1 loạt đạn vào địch `,
        c2: `Slash | Sát thương :10-20-40\nDecade lướt lên phía trước chém 3 đợt kiếm gây choáng sau đó thu về vị trí cũ`,
        c3: `D D D Decade | Sát thương :75\nDecade lao lên trời sau đó tung cú sút mạnh vào địch`
    },
    'doraemon': {
        difficulty: 2,
        passive: `Đánh thường: đại bác không khí | Sát thương :20\n \nNội tại: Tàn dư khí\nTăng thêm 2,5% sát thương nhận vào lên địch với đạn không khí`,
        c1: `Súng laser | Sát thương :45`,
        c2: `Cửa thần kỳ \nChặn mọi loại đạn đi vào cửa trong 3s`,
        c3: `Doraemini (Case 1)\nTạo 3 mini dorae tại vị trí random bắn liên tục đạn vào địch gây 10dame kèm cộng dồn nội tại\n\nĐèn pin phóng to (case 2)\nHóa to 3 minidorae và bản thân nếu phóng to trúng địch gây dame.`
    },
    'allain': {
        difficulty: 2,
        passive: `Đánh thường: Kiếm gầm | Sát thương : 4-8-10\n nội tại: Kiếm gầm\nĐòn đánh thương và chiêu 1 sẽ giúp hồi phục 0,04 và 0,06% HP`,
        c1: `Kiếm lưu ngân | Sát thương: 6-12-15\nChém nhiều nhát chém phía trước mặt kèm choáng`,
        c2: `Kiếm toả mệnh | Sát thương: \nLướt lên gây dame và làm chậm`,
        c3: `Kiếm tất sát | Sát thương: 35 \nKhóa mục tiêu và gây sát thương đồng thời bản thân nhận máu ảo, máu càng thấp máu ảo càng nhiều`
    },
    'shadowpea': {
        difficulty: 2,
        passive: `Đánh thường: Đạn bóng tối | Sát thương :8\n\nNội tại: áp sát bóng tối\nĐứng gần địch giúp bản thân tăng 50% miễn thương và 3 hút máu\n\nĐánh thường :laser bóng tối | Sát thương :17\nBắn 1 tia laser bóng tối phía trước gây debuff lên địch`,
        c1: `Bom bóng tối | Sát thương: 50\n\nBom hắc ám | Sát thương: 75\nSát thương giảm dần khi càng ra xa`,
        c2: `Bóng tối xóa bỏ\nVùng bóng tối sẽ xóa toàn bộ đạn trong đó, với dạng dark sẽ xóa toàn bộ trong map`,
        c3: `Dark form\nHóa dạng bóng tối trong 10s`
    },
    'trump': {
        difficulty: 1,
        passive: `Đánh thường: Dân chủ | Sát thương :15`,
        c1: `Mưa bomb | Sát thương :25\nGọi máy bay thả bomb liên tiếp xuống dưới`,
        c2: `Vịt ngan cọng hành | Sát thương :10\nTriệu hồi vịt ngan cọng hành đuổi theo địch `,
        c3: `Bomb nguyên tử | Sát thương :85\nThả 2 quả bomb nguyên tử xuống vị trí địch`
    },
    'kid': {
        difficulty: 3,
        passive: `Đánh thường: phi bài | Sát thương :7`,
        c1: `Ảo thuật | sát thương :20`,
        c2: `Bài bạc | Sát thương :7-10-15`,
        c3: `Máy bay giấy\nGiảm tốc độ rơi`
    },
    'kid2': {
        difficulty: 2,
        passive: `Hải phòng || Sát thương :15 kid bắn 1 viên đạn gây dame\n\nNội tại: tripple jump`,
        c1: `Máy bay giấy\nGiảm tốc độ rơi`,
        c2: `Cầu đỏ || Sát thương :35\nKid sạc cầu sau đó bắn 1 quả cầu đỏ xuống dưới chân đồng thời đẩy nhẹ bản thân lên `,
        c3: `Bão đạn || Sát thương :7\n( Điều kiện: sử dụng máy bay giấy ) Kid bắn 1 loạt đạn ra xung quanh gây dame`
    },
    'mario': {
        difficulty: 1,
        passive: `Mai rùa || Sát thương :17\nMai rùa sẽ có khả năng xuyên nhiều mục tiêu`,
        c1: `RainbowStar\nBản thân sẽ miễn mọi loại sát thương trong thời gian này`,
        c2: `Hit&Run\nLướt lên phía trước 1 lúc sau đó phát nổ.`,
        c3: `Bowser || Sát thương :8 || HP :75\nTriệu hồi Bowser luôn bắn những quả cầu đuổi theo địch`
    },

    'sonic': {
        difficulty: 1,
        passive: `Vòng vàng || Sát thương 5\nVòng vàng có thể xuyên qua nhiều mục tiêu`,
        c1: `rolling || Sát thương 10\nSonic xoay tròn trong 1 khoảng thời gian gaay sát thương liên tục mỗi 1s sau đó phóng kim thành hình tròn\n\nKim độc || Sát thương :10`,
        c2: `shoot || Sát thương 45\nSonic dịch chuyển ra sau địch sau đó sút một cú sút mạnh vào địch`,
        c3: `bluetornado || Sát thương 6\nLốc xoáy hút địch vào gây dame mỗi giây`
    },

    'tanjiro': {
        difficulty: 2,
        passive: `Thủy trảm || Sát thương :11 \nChém 1 lưỡi kiếm nước về phía trước `,
        c1: `Thủy Xa || Sát thương :17 \nNhảy nhanh lên phía trước, lộn vòng chém 1 vòng cưa`,
        c2: `Lưu Lưu Vũ || Sát thương :20 \nLướt về phía trước tạo vệt cắt`,
        c3: `Sinh Sinh Lưu Chuyển || Sát thương :45 \nĐiều khiển rồng theo bản thân chạm địch gây damage`
    },

    'tanjiro2': {
        difficulty: 2,
        passive: `Hỏa trảm || Sát thương :11 \Chém 1 lưỡi kiếm lửa về phía trước\n\nHỏa thiêu\nMỗi đòn đánh trúng địch đều thiêu đốt địch`,
        c1: `Bích La Thiên || Sát thương :20\n Khi dùng tanjiro lả lướt trên không, gặp địch sẽ chém 1 vòng xoáy lửa và loại bỏ toàn bộ sát thương trong 1s`,
        c2: `Tà Dương Chuyển Thân || Sát thương :15\nTanjiro dịch chuyển ra sau địch sau đó chém mạnh 1 nhát chém vào đầu địch gây choáng`,
        c3: `Viêm Vũ || Sát thương :15|20 \nTanjiro vung 2 nhát chém nhanh vào địch gây choáng`
    },

    'genji': {
        difficulty: 1,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'arisu': {
        difficulty: 3,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'sukuna': {
        difficulty: 2,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'kurumi': {
        difficulty: 1,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'shinnosuke': {
        difficulty: 1,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'umaru': {
        difficulty: 3,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'mahiru': {
        difficulty: 2,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'trieuvan': {
        difficulty: 1,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'telannas': {
        difficulty: 2,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'wukong': {
        difficulty: 1,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'yasuo': {
        difficulty: 2,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'pokra': {
        difficulty: 3,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },

    'levi': {
        difficulty: 5,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    }
    /*
    '': {
        difficulty: ,
        passive: ``,
        c1: ``,
        c2: ``,
        c3: ``
    },
    */
    // Cứ copy cú pháp trên và dán cho các heroId tiếp theo...
};