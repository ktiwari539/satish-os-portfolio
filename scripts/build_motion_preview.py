"""Build an offline, free, illustration-based motion *prototype* from the generated scene.
This is not rigged 3D and does not contain or reconstruct the user's raw photos/videos.
"""
from pathlib import Path
import cv2
import math
import numpy as np
import subprocess

SOURCE=Path("assets/satish-workspace.webp")
OUTPUT=Path("assets/intro-motion-preview.mp4")
image=cv2.imread(str(SOURCE))
if image is None:
    raise RuntimeError("Approved generated illustration missing")
H,W=image.shape[:2]
x,y=np.meshgrid(np.arange(W,dtype=np.float32),np.arange(H,dtype=np.float32))
palm=np.exp(-(((x-90)/84)**6+((y-355)/150)**6))
head=np.exp(-(((x-264)/125)**4+((y-191)/155)**4))
cmd=["ffmpeg","-y","-loglevel","error","-f","rawvideo","-pix_fmt","bgr24","-s",f"{W}x{H}","-r","20","-i","-","-vf","pad=ceil(iw/2)*2:ceil(ih/2)*2","-c:v","libx264","-preset","ultrafast","-crf","23","-pix_fmt","yuv420p","-movflags","+faststart",str(OUTPUT)]
encoder=subprocess.Popen(cmd,stdin=subprocess.PIPE)
for n in range(120):
    t=n/20
    wave=math.sin(2*math.pi*1.35*(t-.5))*np.clip((t-.45)/.7,0,1)*np.clip((3.8-t)/.7,0,1)
    breath=math.sin(t*2.2)
    turn=math.sin(t*1.45+.2)
    dx=palm*(6*wave)+head*(2*turn)
    dy=palm*(1.8*wave)+head*(1.2*breath)
    frame=cv2.remap(image,x-dx.astype(np.float32),y-dy.astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT101)
    blink=max(0,1-abs(t-1.34)/.12,1-abs(t-4.52)/.11)
    if blink>.1:
        for cx,cy,rx in [(218,192,16),(309,176,16)]:
            skin=image[cy-16:cy-10,cx-15:cx+15]
            color=tuple(map(int,cv2.mean(skin)[:3]))
            cv2.ellipse(frame,(cx,cy),(rx,max(2,int(5*blink))),0,0,180,color,-1,cv2.LINE_AA)
            if blink>.6:
                cv2.line(frame,(cx-rx,cy),(cx+rx,cy-1),(45,62,73),1,cv2.LINE_AA)
    encoder.stdin.write(frame.tobytes())
encoder.stdin.close()
if encoder.wait(timeout=60):
    raise RuntimeError("Video encoding failed")
cap=cv2.VideoCapture(str(OUTPUT))
count=int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
cap.release()
if count!=120 or OUTPUT.stat().st_size<30000:
    raise RuntimeError("Video validation failed")
print("PASS: six-second illustration motion prototype encoded:",OUTPUT.stat().st_size,"bytes")
