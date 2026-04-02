class BaseEngine:
    def run(self, target, **kwargs):
        raise NotImplementedError("Each engine must implement run()")