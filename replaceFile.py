import sys
import os


def replaceFile(path, old_tar, new_tar):
    newFile = ""
    filea = open(path, "r+", encoding="utf-8")  
    fileaString = filea.readlines()
    filea.close()
    for row in fileaString:
      if(row.find(old_tar) != -1):
        row = row.replace(old_tar, new_tar)   
      newFile += row 
    os.remove(path)
    filea = open(path, "w", encoding="utf-8") 
    filea.write(newFile)  
    filea.close() 


def main():
    file = sys.argv[1]
    oldTarget = sys.argv[2]
    newTarget = sys.argv[3]
    replaceFile(file, oldTarget, newTarget) 

main()