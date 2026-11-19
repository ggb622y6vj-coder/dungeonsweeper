#!/usr/bin/env python3
"""119: 地下3階の回転床の生成・発動・保存をPCとスマホで検証する。
Serve: python3 -m http.server 8000 --directory dist
Run: python3 tests/119-spinner-browser.py [http://127.0.0.1:8000/]
Requires Playwright Python and Chromium (or CHROME_PATH).
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome') if Path(p).exists()), None)

SPINNER_POSITIONS = "cells => cells.flatMap((c, i) => c.spin === true ? [i] : [])"


def walk(page, action, *rolls):
    used = page.evaluate('''({action, rolls}) => {
        const random = Math.random;
        let used = 0;
        try {
            Math.random = () => rolls[used++] ?? .99;
            move(action);
        } finally {
            Math.random = random;
        }
        return used;
    }''', {'action': action, 'rolls': rolls})
    assert used == len(rolls), (action, rolls, used)
    page.wait_for_function('!logBusy()')


with sync_playwright() as p:
    opts = {'headless': True, 'args': ['--no-sandbox']}
    if chrome:
        opts['executable_path'] = chrome
    browser = p.chromium.launch(**opts)
    for width in (1280, 390):
        context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width == 390)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav')
        floors = page.evaluate('''() => {
            s.elevatorFloors = [3];
            return [...Array(20).fill(3), 2, 4].map((floor, i) => {
                s.guardiansDefeated = i % 2 ? [3] : [];
                fresh(floor);
                return {
                    floor,
                    startType: s.cells[s.start].type,
                    bossType: s.cells[s.boss].type,
                    hasElevator: s.cells.some(c => c.type === 'elevator'),
                    spinners: s.cells.filter(c => c.spin === true),
                };
            });
        }''')
        for i, generated in enumerate(floors):
            spinners = generated['spinners']
            if generated['floor'] == 3:
                assert 1 <= len(spinners) <= 4, generated
                assert all(c['trap'] is False and c['type'] == '' for c in spinners), generated
                assert generated['startType'] == 'stairs'
                assert generated['bossType'] == ('down' if i % 2 else 'boss')
                assert generated['hasElevator']
            else:
                assert not spinners, generated

        origin, spinner, room_log = page.evaluate('''() => {
            s.area = 'town';
            const recruit = generateRecruit('戦士', 0);
            if (!registerRecruit(recruit) || !changeRecruitParty(recruit.members.id, true))
                throw new Error('テスト用パーティーの編成に失敗');
            fresh(3);
            const n = size();
            const spinner = s.cells.findIndex((c, i) =>
                inMapBlindZone(i % n, Math.floor(i / n), n) && !c.type && !s.cells[i - 1].type);
            const origin = spinner - 1;
            s.cells[origin] = {open: true, trap: false, flag: false, type: ''};
            s.cells[spinner] = {open: false, trap: false, flag: false, type: '', spin: true};
            s.pos = origin;
            s.dir = 1;
            render();
            return [origin, spinner, num(spinner) ? `警告：周囲に罠が${num(spinner)}個。`
                                                 : '静かな部屋。周囲に罠はない。'];
        }''')
        logs = page.evaluate('s.logs')
        assert not page.evaluate('index => s.cells[index].open', spinner)
        walk(page, 'forward', .55, .99)
        assert page.evaluate('[s.pos, s.dir, s.cells[s.pos].open, isMapBlind()]') == [spinner, 2, True, True]
        # 初回踏破の通常ログだけが出る。
        assert page.evaluate('s.logs') == [room_log, *logs]

        positions = page.evaluate(f'({SPINNER_POSITIONS})(s.cells)')
        page.evaluate('save()')
        assert page.evaluate(f"({SPINNER_POSITIONS})(JSON.parse(localStorage.getItem('ash-v1')).cells)") == positions
        page.reload()
        page.wait_for_function('!!globalThis.KeyNav && !logBusy()')
        assert page.evaluate(f'({SPINNER_POSITIONS})(s.cells)') == positions

        # 2Fで保存し、再読込後に落とし穴の到着処理で保存済みの回転床へ着地する。
        page.evaluate('() => { travelFloor(2); save(); }')
        assert page.evaluate(f"({SPINNER_POSITIONS})(JSON.parse(localStorage.getItem('ash-v1')).floors[3].cells)") == positions
        page.reload()
        page.wait_for_function('!!globalThis.KeyNav && !logBusy()')
        assert page.evaluate('s.floor') == 2
        assert page.evaluate('''spinner => {
            const candidates = s.floors[3].cells.flatMap((c, i) =>
                !c.type && !c.trap && !c.flag && !c.chest ? [i] : []);
            const landing = candidates.indexOf(spinner);
            if (landing < 0) throw new Error('回転床は落とし穴の着地候補にない');
            const roll = (landing + .5) / candidates.length;
            // 着地で誤って回転した場合も向きの変化を検出する。
            s.dir = (Math.floor(roll * 4) + 1) % 4;
            const dir = s.dir;
            const random = Math.random;
            try {
                Math.random = () => roll;
                return descendPitfall() && s.pos === spinner && s.dir === dir;
            } finally {
                Math.random = random;
            }
        }''', spinner)
        page.wait_for_function('!logBusy()')
        assert page.evaluate('s.floor') == 3
        assert page.evaluate(f'({SPINNER_POSITIONS})(s.cells)') == positions

        # 西のマスへ戻り、再び徒歩で入る。探索済みのためログは変化しない。
        page.evaluate('() => { s.dir = 1; }')
        logs = page.evaluate('s.logs')
        walk(page, 'back', .99)
        assert page.evaluate('[s.pos, s.dir]') == [origin, 1]
        walk(page, 'forward', .99, .99)
        assert page.evaluate('[s.pos, s.dir, s.cells[s.pos].open]') == [spinner, 3, True]
        assert page.evaluate('s.logs') == logs
        assert not errors, errors
        print(f'PASS 119 {width}px: generation, silent walking trigger, pitfall exclusion, save and restore')
        context.close()
    browser.close()
