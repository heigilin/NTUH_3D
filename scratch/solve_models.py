import re
import esprima

with open('js/building-models.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# All 33 places where '});' was stripped:
# Let's define the exact line indices (1-based line number):
# 1. line 73: indent 6 (bGroup.traverse)
# 2. line 229: indent 6 (boxCoords.forEach)
# 3. line 263: indent 6 (].forEach(pos =>)
# 4. line 385: indent 6 (matOchreTile)
# 5. line 393: indent 6 (matOchreDark)
# 6. line 401: indent 6 (matOchreLight)
# 7. line 411: indent 6 (matDarkWindow)
# 8. line 425: indent 6 (matAtriumGlass)
# 9. line 445: indent 6 (matGableGlass)
# 10. line 549: indent 8 ([-10.0, 0, 10.0].forEach(tx =>)
# 11. line 551: indent 6 ([-20.0, 20.0].forEach(courtZ =>)
# 12. line 689: indent 8 ([-towerW_Z...].forEach(colZ =>)
# 13. line 727: indent 10 ([-1.9, 1.9].forEach(wz =>)
# 14. line 769: indent 12 ([-towerW_Z...].forEach(sideZ =>)
# 15. line 827: indent 10 ([-1.7, 1.7].forEach(wz =>)
# 16. line 865: indent 6 (fourTowers.forEach(tw =>)
# 17. line 913: indent 10 ([-4.0, 6.0].forEach(bxOffset =>)
# 18. line 915: indent 8 ([25.2, 39.6].forEach(by =>)
# 19. line 917: indent 6 (skybridgeBays.forEach(sb =>)
# 20. line 963: indent 6 ([-4.0, 0, 4.0].forEach(colZ =>)
# 21. line 1005: indent 6 ([14.4, 25.2, 36.0, 46.8].forEach(by =>)
# 22. line 1047: indent 6 (colZArr.forEach(cz =>)
# 23. line 1101: indent 6 (colZArr.forEach(cz =>)
# 24. line 1127: indent 6 (gables.forEach(g =>)
# 25. line 1187: indent 6 ([-porchW_Z...].forEach(pzPlanter =>)
# 26. line 1261: indent 6 ([-1.4, 1.4].forEach(hx =>)
# 27. line 1339: indent 6 ([-9.0, -4.5...].forEach(wx =>)
# 28. line 1389: indent 8 ([-0.45, 0.45].forEach(pairZ =>)
# 29. line 1397: indent 6 ([-6.5, -2.2...].forEach(cx =>)
# 30. line 1473: indent 6 ([-5.0, 5.0].forEach(gx =>)
# 31. line 1693: indent 6 ([-1, 1].forEach(dir =>)
# 32. line 1739: indent 8 ([-pavD / 2...].forEach(cz =>)
# 33. line 1741: indent 6 ([-pavW / 2...].forEach(cx =>)

# Let's inspect surrounding lines for each to verify exact line number
replacements = {
    73: 6,
    229: 6,
    263: 6,
    385: 6,
    393: 6,
    401: 6,
    411: 6,
    425: 6,
    445: 6,
    # Lines 517-555
    # Lines 675-870
    # etc.
}

print('Writing script to check lines...')
