<!-- htmlcs-disable -->
<!DOCTYPE html>
<html lang="zh-Hans">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <style>
            main {
                max-width: 760px;
                margin: 20px auto;
            }

            img {
                max-width: 100%;
            }
        </style>
        <title>Highlighter: a mini tool for highlighting website text</title>
    </head>
    <body>
        <main>
            {{$markdown}}
        </main>
        <section class="op-panel">
            <div>
                <label class="op-name">高亮code：</label>
                <label><input name="exception" type="radio" value="on" checked />禁止</label>
                <label><input name="exception" type="radio" value="off" />允许</label>
            </div>
            <div>
                <label class="op-name">自动高亮：</label>
                <label><input name="auto" type="radio" value="on" checked />开启</label>
                <label><input name="auto" type="radio" value="off" />关闭</label>
            </div>
            <button class="op-btn disabled" id="js-highlight" disabled >手动高亮选区</button>
        </section>
    </body>
</html>