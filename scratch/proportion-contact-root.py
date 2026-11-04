from PIL import Image
from pathlib import Path
import sys
floor=int(sys.argv[1]);names={7:['7A','7B','7C','7D'],8:['08A','08B','08C','08D'],9:['09A','09B','09C','09D'],11:['11A','11B','11C','11D'],12:['12A','12B','12C','12D'],13:['13A','13B','13C','13D'],14:['14A','14B','14C','14D'],15:['15A','15B','15C','15D']}[floor]
board=Image.new('RGB',(1800,1000),'#e9eef1')
for i,w in enumerate(names):
 with Image.open('scratch/proportion-check-root/'+w+'_'+str(floor)+'F_before.png')as a:
  im=a.convert('RGB');im.thumbnail((890,490));board.paste(im,(i%2*900,i//2*500))
board.save('scratch/proportion-check-root/E'+str(floor)+'-ABCD-before.png')
