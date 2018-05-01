// Copyright (c) 2015-2018 Robert Rypuła - https://audio-network.rypula.pl

import { Injector } from 'rr-tsdi';

import { LIST_FACTORY, SIMPLE_MATH } from './../common';
import { COMPLEX_LIST_UTIL } from './complex-list-util/di-token';
import { COMPLEX_FACTORY } from './complex/di-token';
import { DSP_MODULE } from './di-token';
import { FOURIER_TRANSFORM } from './fourier-transform/di-token';

import { ListFactory, SimpleMath } from './../common';
import { ComplexListUtil } from './complex-list-util/complex-list-util';
import { ComplexFactory } from './complex/complex-factory';
import { DspModule } from './dsp-module';
import { IDspModule } from './dsp-module.interface';
import { FftDitRecursive } from './fourier-transform/fft-dit-recursive/fft-dit-recursive';

describe('DspModule', () => {
  it('should properly provide all expected items', () => {
    const injector = new Injector();
    let dspModule: IDspModule;

    injector.registerService(SIMPLE_MATH, SimpleMath);
    injector.registerService(LIST_FACTORY, ListFactory);

    injector.registerService(COMPLEX_LIST_UTIL, ComplexListUtil);
    injector.registerService(COMPLEX_FACTORY, ComplexFactory);
    injector.registerService(FOURIER_TRANSFORM, FftDitRecursive);
    injector.registerService(DSP_MODULE, DspModule);

    dspModule = injector.get(DSP_MODULE);

    expect(dspModule).toBeInstanceOf(DspModule);
    expect(dspModule.complexListUtil).toBeInstanceOf(ComplexListUtil);
    expect(dspModule.complexFactory).toBeInstanceOf(ComplexFactory);
    expect(dspModule.fourierTransform).toBeInstanceOf(FftDitRecursive);
  });
});
