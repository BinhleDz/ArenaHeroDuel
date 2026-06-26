/*CutTaraxacum (ngoại hình là chim cánh cụt xám sáng có đầy đủ cánh chân):
thêm hiệu ứng : assets/icon/buff/cut_knight.png (sử dụng để kích hoạt nội tại dạng đấu sĩ)
thêm hiệu ứng assets/icon/buff/cut_magic (assets/icon/buff/hasteatk.png) phần thời gian là stack cộng dồn  : mỗi lần ở dạng pháp sư đánh trúng địch bản thân sẽ được +1 điểm mỗi điểm +2,5% tốc đánh , chuyển dạng vẫn giữ nội tại nhưng chỉ tăng cho dạng pháp sư
thêm hiệu ứng : assets/icon/debuff/stunf.png (giống stuncc nhưng khi gặp hiệu ứng flame hiệu ứng này sẽ bị hủy ngay lập tức) (tương tác đặc biệt: tanjiro nhận thêm 2dame/s nếu nhận hiệu ứng này, tanjirov2 sẽ chuyển hiệu ứng này thành assets/icon/debuff/slowness 25% và giữ nguyên thời gian)
nội tại : mỗi 10 lần gây dame sẽ khiến địch assets/icon/debuff/stunf 0,75s (thêm hiệu ứng assets/icon/debuff/cut_hit.png phần thời gian là stack hiển thị cộng dồn) (dù là đòn nào đều tính gây dame
nội tại 2 : chuyển giữa 2 dạng kiếm sĩ và pháp sư (mặc định pháp sư)(sử dụng c và m để chuyển dạng) (thêm hiệu ứng assets/icon/buff/cut_nt.png để đếm hồi chiêu của nội tại khi nào hiệu ứng mất có thể dùng nội tại và khi dùng nhận hiệu ứng đếm trong 5s để đổi tiếp) mỗi lần chuyển dạng bản thân phải vận 0,5s
nội tại 3 : tương tác đặc biệt với shadowpeashoter và pokra trên trời mỗi 2s sẽ spawn ra 2 quả bom bồ công anh rơi xuống (hoa bồ công anh nhưng chân gắn 1 quả bom nhấp nháy đen đỏ, nổ khi chạm đất (chạm bậc nhảy ko tính) hoặc địch gây sát thương trong phạm vi 125px (hitbox cánh bồ công anh bán kính là 25px) nếu địch dính đòn nhận 25dame (rơi chậm và nhẹ nhàng tốc độ random liên tục)

- dạng pháp sư: cánh 1 bên cầm sách 1 bên cầm gậy phép
nội tại dạng : 
đánh thương (ko tự nhận dame) : bắn 1 gai băng nhọn trúng địch gây 6dame và tạo ra 3 hạt băng thành hình quạt góc 10 độ bay tiếp ra sau (cách vị trí trúng 50px) chạm tường sẽ bị bật lại 1 lần theo đúng vật lý nhưng ko có lực cản lần sau đạn sẽ bị hủy
chiêu 1 (ko tự nhận dame) vận 0,3s khi vận tạo hiệu ứng phóng băng mờ mờ ảo ảo lên trời, sau đó mỗi 0,5s kim băng lớn rơi thẳng xuống 50% cách vị trí trục x địch 200px và 50% là ngoài 200px đó tốc độ rơi nhanh rơi chạm đất (có tỉ lệ 40% sẽ chạm bậc nếu vị trí rơi ngoài 200px, mặc định là di chuyển xuyên qua bậc) hoặc địch gây 75dame tạo hiệu ứng băng vỡ sau đó bắn 10 cầu băng nhỏ ra xung quanh đều thành hình tròn mỗi quả gây 10dame (4 kim băng lớn) cầu băng này chạm tường sẽ bị hủy

chiêu 2 (ko tự nhận dame) phát nổ tại vị trí bản thân gây choáng địch 1s trong phạm vi 250px (ko gây dame) và bắn 20 kim băng nhỏ thành hình quạt 3 lần mỗi lần cách nhau 0,5s trúng 1 kim nhận 12dame (bản thân khựng ko thể làm gì trong thời gian dùng chiêu)

chiêu 3 (ko tự nhận dame) Ném 1 quả cầu băng nhỏ (gốc bán kính 75px, dame 30) lăn trên mặt đất quả cầu sẽ lớn dần 2px mỗi 3frame, sát thương tăng 1dame/s trúng tường sẽ lăn theo hướng khác và vẫn tiếp tục to dần (chạm tường tối thiểu 3 lần sau đó mỗi lần chạm tường tỉ lệ 20% nổ ra 20 kim băng nhỏ thành hình tròn đều gây 12dame nếu trúng,
	nếu 2 quả cầu từ chiêu 3 tự đập trúng nhau 2 quả cầu sẽ bị clear và bắn 1 chùm lazer lên trời nếu lazer trúng địch gây 200dame, sau 1s khi lazer được bắn rơi 1 kim băng lớn của chiêu 1 mỗi 0,3s xuống (rơi trong 7s)
- dạng đấu sĩ : (làm sau)

-dạng đấu sĩ:2 cánh phát sáng 3px ở rìa để tạo cảm giác cánh sắc bén tầm đánh gần 120px (vết cắt băng xanh) gây 7dame (mỗi lần kích hoạt chém 2 lần cách nhau 10frame (khi đánh thường khựng 20frame)
nội tại dạng : sau khi dùng chiêu nhận assets/icon/buff/cut_knight.png khi có hiệu ứng này đòn đánh thường chuyển dạng tiếp cận (tạo vòng 250px hiển thị tầm đánh, chỉ kích hoạt khi địch trong phạm vi) lướt đến địch đâm choáng 0,2s và gây 28dame
chiêu 1: chém 1 nhát chém vòng cung bán kính 200px gây 15dame sau 0,5s đó chém 1 nhát xuống dưới đất tạo 3 gai băng mọc lên gây sát thương vòng cung (3 gai băng chỉ là hiệu ứng chứ vùng sát thương như chém) trong bán kính 250px gây choáng địch 1s và gây 25dame
chiêu 2 : xoay tròn (trong game sẽ là oval) gây sát thương trái phải 100px gây 20dame sau đó phóng 2 nhát cắt ra 2 bên (có thể xuyên nhiều mục tiêu) gây 10dame
chiêu 3 : chém trong phạm vi bán kính 200px liên tiếp 6 lần trong 0,5s mỗi lần 4dame kèm hiệu ứng slowness 50% 2s trong nhát chém đầu sau đo tạo vùng 200px sáng dần trong 0,75s rồi nổ gây choáng 0,7s gây 20dame
class tướng tại Cuttaraxacum.js nhưng vẫn phải giữ pick tướng, random tướng, triggerskill, excuteskill,draw,... ở arenaheroduel như các tướng khác 
*/
