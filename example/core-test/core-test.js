var
    ReceiveMulticoreWorker = AudioNetwork.Injector.resolve('PhysicalLayerCore.ReceiveMulticoreWorker'),
    ReceiveWorker = AudioNetwork.Injector.resolve('PhysicalLayerCore.ReceiveWorker'),
    Stopwatch = AudioNetwork.Injector.resolve('Common.Stopwatch'),
    SimplePromiseBuilder = AudioNetwork.Injector.resolve('Common.SimplePromiseBuilder'),
    Util = AudioNetwork.Injector.resolve('Common.Util'),

    rwSingle = [],
    sSingleTotal,
    rwSingleStarted = 0,
    rwSingleFinished = 0,
    rwMulti = [],
    sMultiTotal,
    rwMultiStarted = 0,
    rwMultiFinished = 0,

    THREAD_SIZE = 2,
    BUFFER_SIZE = 1,//256 * 1024,
    buffer = [];

function log(s) {
    var
        element = document.getElementById('log'),
        args = Array.prototype.slice.call(arguments);

    console.log.apply(this, args);
    element.innerHTML += args.join(' ') + '\n';
}

function compare() {
    var ratio = sSingleTotal.getDuration() / sMultiTotal.getDuration();

    log('ratio ' + ratio);
}

function run() {
    var i;

    // single
    log(':: single thread START ::');
    sSingleTotal.start();
    for (i = 0; i < THREAD_SIZE; i++) {
        rwSingleStarted++;
        log('  started so far: ' + rwSingleStarted);
        rwSingle[i]
            .handleSampleBlock(buffer)
            .then(function (data) {
                rwSingleFinished++;
                log('  finished so far: ' + rwSingleFinished);
                log('      --> key: ' + data.key);
                log('      --> result: ', data.result);
                if (rwSingleFinished === THREAD_SIZE) {
                    log(':: single thread END ::');
                    log('Duration: ' + sSingleTotal.stop().getDuration(true) + ' sec');
                    log('---');
                }
            });
    }

    // multi
    log(':: multi thread START ::');
    sMultiTotal.start();
    for (i = 0; i < THREAD_SIZE; i++) {
        rwMultiStarted++;
        log('  started so far: ' + rwMultiStarted);
        rwMulti[i]
            .handleSampleBlock(buffer)
            .then(function (data) {
                rwMultiFinished++;
                log('  finished so far: ' + rwMultiFinished);
                log('      --> key: ' + data.key);
                log('      --> result: ', data.result);
                if (rwMultiFinished === THREAD_SIZE) {
                    log(':: multi thread END ::');
                    log('Duration: ' + sMultiTotal.stop().getDuration(true) + ' sec');
                    log('---');
                    compare();
                }
            });
    }
}

function init() {
    var i, threadReadyPromiseList, sw;

    for (i = 0; i < BUFFER_SIZE; i++) {
        buffer.push(Math.sin(2 * Math.PI * (i / 16 - 0.25) ));
    }

    threadReadyPromiseList = [];
    for (i = 0; i < THREAD_SIZE; i++) {
        rwSingle.push(new ReceiveWorker(i));
        sSingleTotal = new Stopwatch();
        rwMulti.push(new ReceiveMulticoreWorker(i));
        sMultiTotal = new Stopwatch();
        threadReadyPromiseList.push(rwMulti[i].getInitialization());
    }

    sw = new Stopwatch();
    log('Waiting for all threads...');
    sw.start();
    SimplePromiseBuilder
        .buildFromList(threadReadyPromiseList)
        .then(function () {
            log('All threads ready in ' + sw.stop().getDuration(true) + 'sec');
            run();
        });
}

setTimeout(function () {
    document.write('<pre id="log"></pre>');
    setTimeout(init, 0);
}, 2000);
